import { internalServerError, response } from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"

const store: RequestHandler = async (req, res) => {
  try {
    response(res, 200, "Store endpoint is working", {
      data: {
        message: "Store endpoint is working",
      },
    })
  } catch (error) {
    internalServerError(res, error)
  }
}

export default store