import { Router } from "express"
import MainController from "./controllers/main"
import DataController from "./controllers/data"
import SparePartController from "./controllers/spare-part"

const router = Router()

router.get("/", MainController.root)

router.get("/data", DataController.index)
router.post("/data", DataController.store)

router.get("/spare-parts", SparePartController.getAll)
router.post("/spare-parts", SparePartController.store)
router.patch("/spare-parts/:id", SparePartController.patch)
router.delete("/spare-parts/:id", SparePartController.destroy)

export default router
