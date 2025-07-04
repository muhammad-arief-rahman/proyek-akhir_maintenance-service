import { internalServerError, response } from "@ariefrahman39/shared-utils"
import axios from "axios"
import type { RequestHandler } from "express"
import { z } from "zod"
import { storeSchema } from "../../../schema/maintenance/store"
import prisma from "../../../lib/db"

const store: RequestHandler = async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
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

      // Check if the unit instance exists
      try {
        const response = await axios.get(
          `${process.env.UNIT_SERVICE_URL}/data/instance/${parsedData.unitInstanceId}`
        )
      } catch (error) {
        response(res, 404, "Unit instance not found")
        return
      }

      // Create the maintenance record
      const maintenance = await tx.maintenanceData.create({
        data: {
          currentSmr: parsedData.currentSmr,
          notes: parsedData.notes ?? "No notes provided",
          serviceDate: parsedData.serviceDate,
          unitInstanceId: parsedData.unitInstanceId,
        },
      })

      // Create the maintenance details
      const details = await tx.maintenanceDetail.createMany({
        data: parsedData.details.map((hours) => ({
          hours,
          maintenanceId: maintenance.id,
        })),
      })

      // Create the maintenance evidences
      let mediaIds: string[] = []

      for (const file of parsedData.evidences as Express.Multer.File[]) {
        if (!file) continue

        const formData = new FormData()

        const fileBlob = new Blob([file.buffer], {
          type: file.mimetype,
        })

        formData.set("file", fileBlob, file.originalname)

        const response = await axios.post(
          `${process.env.MEDIA_SERVICE_URL}/data`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )

        const mediaId = response.data?.data?.[0]

        if (mediaId) {
          mediaIds.push(mediaId)
        }
      }

      // Create the maintenance evidences
      const evidences = await tx.maintenanceEvidence.createMany({
        data: mediaIds.map((mediaId) => ({
          mediaId,
          maintenanceDataId: maintenance.id,
        })),
      })

      response(res, 200, "Store endpoint is working", {
        maintenance,
        details,
        evidences,
      })
      return
    })

    internalServerError(
      res,
      "Something went wrong while processing your request"
    )
  } catch (error) {
    console.error("Error in store endpoint:", error)

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
