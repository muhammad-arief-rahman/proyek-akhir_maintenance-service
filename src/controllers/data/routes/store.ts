import { internalServerError, response } from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"
import { z } from "zod"
import { saveFile } from "../../../../../media/src/lib/utils"

const storeSchema = z.object({
  unitInstanceId: z
    .string({
      required_error: "Unit instance ID is required",
      invalid_type_error: "Unit instance ID must be a string",
    })
    .min(1, {
      message: "Unit instance ID must be at least 1 character long",
    }),
  currentSmr: z.coerce
    .number({
      required_error: "Current SMR is required",
      invalid_type_error: "Current SMR must be a number",
    })
    .min(0, {
      message: "Current SMR must be a positive number",
    }),
  notes: z
    .string({
      required_error: "Notes are required",
    })
    .min(1, {
      message: "Notes must be at least 1 character long",
    })
    .optional(),
  serviceDate: z.coerce
    .date({
      required_error: "Service date is required",
    })
    .refine((date) => date <= new Date(), {
      message: "Service date cannot be in the future",
    }),
  details: z.array(
    z.coerce
      .number({
        required_error: "Hour periods are required",
        invalid_type_error: "Hour periods must be a number",
      })
      .min(0, {
        message: "Hour periods must be a positive number",
      })
      .refine((hours) => hours % 500 === 0, {
        message: "Hour periods must be a multiple of 500",
      })
  ),
  // Array of images
  evidences: z
    .array(
      z
        .any({
          required_error: "Evidences are required",
        })
        .refine((file) => file.size <= 5 * 1024 * 1024, {
          message: "Each evidence must be less than 5MB",
        })
        .refine((file) => file.mimetype.startsWith("image/"), {
          message: "Each evidence must be an image",
        })
    )
    .min(1, {
      message: "At least one evidence is required",
    }),
})

const store: RequestHandler = async (req, res) => {
  try {
    const bodyData = {
      ...(req.body ?? {}),
      evidences: (req.files as Express.Multer.File[])
        .map((file) => {
          if (file.fieldname === "evidences[]") return file

          return null
        })
        .filter(Boolean),
      details: req.body["details.hours"],
    }

    const parsedData = storeSchema.parse(bodyData)

    for (const file of parsedData.evidences as Express.Multer.File[]) {
      const path = await saveFile(file, "maintenance-evidences")

      console.log(`File saved at: ${path}`)
    }

    response(res, 200, "Store endpoint is working", parsedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      response(res, 422, "Validation error", error.errors, {
        validationType: "ZodError",
      })
      return
    }

    internalServerError(res, error)
  }
}

export default store
