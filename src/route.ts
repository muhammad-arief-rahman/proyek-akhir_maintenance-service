import { Router } from "express"
import MainController from "./controllers/main"
import DataController from "./controllers/data"

const router = Router()

router.get("/", MainController.root)

router.get("/data", DataController.index)
router.post("/data", DataController.store)

export default router
