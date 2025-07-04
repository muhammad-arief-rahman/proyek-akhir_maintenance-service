import {
  deleteMedia,
  internalServerError,
  response,
} from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"
import prisma from "../../../lib/db"

const destroy: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params

    const sparePart = await prisma.sparePart.findUnique({
      where: { id },
    })

    if (!sparePart) {
      response(res, 404, "Spare part not found")
      return
    }

    if (sparePart.mediaId) {
      await deleteMedia(sparePart.mediaId)
    }

    await prisma.sparePart.delete({
      where: { id },
    })

    response(res, 200, "Spare part deleted successfully")
  } catch (error) {
    internalServerError(res, error)
  }
}

export default destroy
