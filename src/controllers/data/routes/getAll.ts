import { internalServerError, response } from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"

const getAll: RequestHandler = async (req, res) => {
  try {
    response(res, 200, "Got all data successfully")
  } catch (error) {
    internalServerError(res, error)
  }
}

export default getAll
