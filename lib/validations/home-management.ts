import { z } from 'zod'

export const homeCreateSchema = z.object({
  regionId: z.string().min(1, 'Region is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  sdaType: z.string().optional(),
  totalRooms: z.number().min(0, 'Must be a valid number'),
  totalBathrooms: z.number().min(0, 'Must be a valid number'),
  totalKitchens: z.number().min(0, 'Must be a valid number'),
  totalParkingSpaces: z.number().min(0, 'Must be a valid number'),
  totalSharedSpaces: z.number().min(0, 'Must be a valid number'),
  hasFrontYard: z.boolean().optional(),
  hasBackyard: z.boolean().optional(),
  hasSwimmingPool: z.boolean().optional(),
  maxCapacity: z.number().min(0, 'Must be a valid number'),
  status: z.enum(['Active', 'Inactive']).optional(),
})

export const homeUpdateSchema = homeCreateSchema.partial()

export const homeFiltersSchema = z.object({
  regionId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
})

export type HomeCreateInput = z.infer<typeof homeCreateSchema>
export type HomeUpdateInput = z.infer<typeof homeUpdateSchema>
export type HomeFilters = z.infer<typeof homeFiltersSchema>
