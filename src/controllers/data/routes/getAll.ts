import {
  createResponsePagination,
  internalServerError,
  response,
} from "@ariefrahman39/shared-utils"
import type { RequestHandler, Response } from "express"
import prisma from "../../../lib/db"
import type { Prisma } from "../../../generated/prisma"

const getAll: RequestHandler = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      organizationId = "",
      noPagination = "false",
    } = req.query as Record<string, string>

    const whereQuery: Prisma.MaintenanceDataWhereInput = {
      OR: [
        {
          details: {
            some: {
              currentSmr: {
                // Give a range for search
                gt: search ? parseFloat(search) - 1 : undefined,
                lt: search ? parseFloat(search) + 1 : undefined,
              },
            },
          },
        },
        {
          details: {
            some: {
              notes: {
                contains: search,
              },
            },
          },
        },
        {
          details: {
            some: {
              serviceDate: {
                equals: search ? new Date(search) : undefined,
              },
            },
          },
        },
      ],
    }

    if (noPagination === "true") {
      const maintenanceData = await prisma.maintenanceData.findMany({
        include: {
          details: {
            include: {
              evidences: true,
            },
          },
        },
        where: whereQuery,
      })

      response(res, 200, "Got all data successfully", maintenanceData)
      return
    }

    const maintenanceData = await prisma.maintenanceData.findMany({
      include: {
        details: {
          include: {
            evidences: true,
          },
        },
      },
      where: whereQuery,
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    const totalMaintenanceData = await prisma.maintenanceData.count({
      where: whereQuery,
    })

    response(res, 200, "Got all data successfully", maintenanceData, {
      pagination: createResponsePagination({
        data: maintenanceData,
        totalData: Math.ceil(totalMaintenanceData / Number(limit)),
        page,
      }),
    })
  } catch (error) {
    internalServerError(res, error)
  }
}

export default getAll
