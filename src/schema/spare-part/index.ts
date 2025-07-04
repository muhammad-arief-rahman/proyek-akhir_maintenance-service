import { multerFileSchema } from "@ariefrahman39/shared-utils"
import { optionalMulterFileSchema } from "@ariefrahman39/shared-utils/src/schema/media"
import { z } from "zod"

const sparePartBaseSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  startPrice: z.coerce
    .number({
      required_error: "Start price is required",
      invalid_type_error: "Start price must be a number",
    })
    .min(0, "Start price must be greater than or equal to 0"),
  endPrice: z.coerce
    .number({
      required_error: "End price is required",
      invalid_type_error: "End price must be a number",
    })
    .min(0, "End price must be greater than or equal to 0"),
  partNumber: z
    .string({
      required_error: "Part number is required",
      invalid_type_error: "Part number must be a string",
    })
    .min(1, "Part number is required")
    .max(50, "Part number must be less than 50 characters"),
  category: z
    .string({
      required_error: "Category is required",
      invalid_type_error: "Category must be a string",
    })
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  unitId: z
    .string({
      required_error: "Unit ID is required",
      invalid_type_error: "Unit ID must be a string",
    })
    .min(1, "Unit ID is required")
    .max(50, "Unit ID must be less than 50 characters"),
})

const sparePartStoreSchema = sparePartBaseSchema
  .extend({
    image: multerFileSchema,
  })
  .refine((data) => data.startPrice <= data.endPrice, {
    message: "Start price must be less than or equal to end price",
    path: ["startPrice"],
  })

const sparePartPatchSchema = sparePartBaseSchema
  .extend({
    image: optionalMulterFileSchema,
  })
  .partial()
  .refine((data) => (data.startPrice ?? 0) <= (data.endPrice ?? 0), {
    message: "Start price must be less than or equal to end price",
    path: ["startPrice"],
  })

export default sparePartStoreSchema

export { sparePartPatchSchema }

export type SparePartStoreSchema = z.infer<typeof sparePartStoreSchema>
export type SparePartPatchSchema = z.infer<typeof sparePartPatchSchema>
