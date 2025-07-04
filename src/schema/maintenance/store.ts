import { z } from "zod"

export const storeSchema = z.object({
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

export type StoreData = z.infer<typeof storeSchema>
