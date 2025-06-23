import { response } from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"

const root: RequestHandler = async (req, res) => {
  response(res, 200, "Maintenance Service is running")
}

const MainController = {
  root
}

export default MainController

