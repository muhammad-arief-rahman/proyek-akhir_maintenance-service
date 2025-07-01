import express from "express"
import multer from "multer"
import router from "./src/route"
import type { Prisma } from "./src/generated/prisma"
import { PrismaClient } from "./src/generated/prisma"

const app = express()
const port = process.env.PORT || 5004

app.use(express.json({ limit: "50mb" }))
app.use(multer().any())

app.use("/", router)

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" })
})

app.listen(port, () => {
  console.log(`Maintenance-Service is running on port ${port}`)
})
