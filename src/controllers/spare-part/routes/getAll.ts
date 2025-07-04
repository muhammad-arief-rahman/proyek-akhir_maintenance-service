import { internalServerError, response } from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"
import prisma from "../../../lib/db"

const getAll: RequestHandler = async (req, res) => {
  try {
    const spareParts = await prisma.sparePart.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    response(res, 200, "Spare parts retrieved successfully", spareParts)
  } catch (error) {
    internalServerError(res, error)
  }
}

export default getAll
