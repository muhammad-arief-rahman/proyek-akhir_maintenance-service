import {
  getMulterFile,
  internalServerError,
  response,
  storeMedia,
} from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"
import { ZodError } from "zod"
import sparePartStoreSchema from "../../../schema/spare-part"
import prisma from "../../../lib/db"

const store: RequestHandler = async (req, res) => {
  try {
    const bodyData = {
      ...req.body,
      image: getMulterFile(req.files, "image"),
    }

    const parsedData = sparePartStoreSchema.parse(bodyData)

    await prisma.$transaction(async (tx) => {
      const [mediaId] = await storeMedia(parsedData.image)

      if (!mediaId) throw new Error("Failed to store image")

      const { image, ...createData } = parsedData

      const sparePart = await tx.sparePart.create({
        data: {
          ...createData,
          mediaId: mediaId,
        },
      })

      response(res, 200, "Spare part stored successfully", sparePart)
    })
  } catch (error) {
    if (error instanceof ZodError) {
      response(res, 422, "Validation error", error.errors, {
        validationType: "ZodError",
      })
      return
    }
    internalServerError(res, error)
  }
}

export default store
