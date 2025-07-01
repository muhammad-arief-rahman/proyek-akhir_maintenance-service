import { response } from "@ariefrahman39/shared-utils"
import type { RequestHandler } from "express"

const root: RequestHandler = async (req, res) => {
  res.status(204).send()
}

const MainController = {
  root
}

export default MainController

