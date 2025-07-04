import {
  deleteMedia,
  getMulterFile,
  internalServerError,
  response,
  storeMedia,
} from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"
import { ZodError } from "zod"
import sparePartStoreSchema, {
  sparePartPatchSchema,
} from "../../../schema/spare-part"
import prisma from "../../../lib/db"

const patch: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params

    const sparePart = await prisma.sparePart.findUnique({
      where: {
        id: id,
      },
    })

    if (!sparePart) {
      response(res, 404, "Spare part not found")
      return
    }

    const bodyData = {
      ...req.body,
      image: getMulterFile(req.files, "image"),
    }

    const parsedData = sparePartPatchSchema.parse(bodyData)

    await prisma.$transaction(async (tx) => {
      let mediaId: string | null = sparePart.mediaId

      if (parsedData.image && mediaId) {
        const deletedMediaResult = await deleteMedia(mediaId)

        const [newMdiaId] = await storeMedia(parsedData.image)

        if (!newMdiaId) throw new Error("Failed to store new image")

        mediaId = newMdiaId
      }

      const { image, ...patchData } = parsedData

      const updatedSparePart = await tx.sparePart.update({
        where: {
          id: id,
        },
        data: {
          ...patchData,
          mediaId: mediaId,
        },
      })

      response(res, 200, "Spare part stored successfully", updatedSparePart)
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

export default patch
