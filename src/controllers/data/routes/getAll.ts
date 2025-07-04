import {
  type APIResponse,
  createResponsePagination,
  internalServerError,
  response,
} from "@ariefrahman39/shared-utils"
import type { RequestHandler, Response } from "express"
import prisma from "../../../lib/db"
import type { Prisma } from "../../../generated/prisma"
import axios from "axios"
import type { CompleteOperationalData } from "../../../types/unit/complete-data"

async function getUnitData() {
  try {
    const response = await axios.get<APIResponse<CompleteOperationalData[]>>(
      `${process.env.UNIT_SERVICE_URL}/data?noPagination=true`
    )
    return response.data?.data
  } catch (error) {
    return []
  }
}

function mapUnitWithMaintenanceData(
  unitData: CompleteOperationalData[],
  maintenanceData: Awaited<ReturnType<typeof prisma.maintenanceData.findMany>>
) {
  return unitData.map((unit) => {
    const maintenances = maintenanceData.filter(
      (m) => unit.instanceId === m.unitInstanceId
    )

    return {
      ...unit,
      maintenances: maintenances.length > 0 ? maintenances : null,
    }
  })
}

const getAll: RequestHandler = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      noPagination = "false",
    } = req.query as Record<string, string>

    const unitData = await getUnitData()

    if (noPagination === "true") {
      const maintenanceData = await prisma.maintenanceData.findMany({
        include: {
          evidences: true,
          details: true,
        },
      })

      const mappedUnitData = mapUnitWithMaintenanceData(
        unitData,
        maintenanceData
      )

      response(
        res,
        200,
        "Maintenance data fetched successfully",
        mappedUnitData
      )
      return
    }

    response(res, 200, "Maintenance data fetched successfully", {
      nre: "bre",
    })
  } catch (error) {
    internalServerError(res, error)
  }
}

export default getAll
