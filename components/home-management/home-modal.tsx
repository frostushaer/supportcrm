'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useRegionStore } from '@/store/region-store'
import { useCreateHome, useUpdateHome } from '@/hooks/use-home-management'
import { homeCreateSchema, type HomeCreateInput } from '@/lib/validations/home-management'

interface HomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  home?: any
  mode?: 'create' | 'edit'
}

const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']
const PROPERTY_TYPES = ['House', 'Unit', 'Apartment', 'Townhouse', 'Villa']
const SDA_TYPES = ['Not Applicable', 'Fully Accessible', 'High Physical Support', 'Improved Liveability', 'Robust']

export function HomeModal({ open, onOpenChange, home, mode = 'create' }: HomeModalProps) {
  const { selectedRegionId } = useRegionStore()
  const createHome = useCreateHome()
  const updateHome = useUpdateHome()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeCreateInput>({
    resolver: zodResolver(homeCreateSchema as any),
    defaultValues: {
      regionId: selectedRegionId || '',
      streetAddress: '',
      suburb: '',
      state: '',
      postalCode: '',
      propertyType: '',
      sdaType: 'Not Applicable',
      totalRooms: 0,
      totalBathrooms: 0,
      totalKitchens: 0,
      totalParkingSpaces: 0,
      totalSharedSpaces: 0,
      hasFrontYard: false,
      hasBackyard: false,
      hasSwimmingPool: false,
      maxCapacity: 0,
      status: 'Active',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && home) {
        reset({
          regionId: home.regionId,
          streetAddress: home.streetAddress,
          suburb: home.suburb,
          state: home.state,
          postalCode: home.postalCode,
          propertyType: home.propertyType,
          sdaType: home.sdaType || 'Not Applicable',
          totalRooms: home.totalRooms,
          totalBathrooms: home.totalBathrooms,
          totalKitchens: home.totalKitchens,
          totalParkingSpaces: home.totalParkingSpaces,
          totalSharedSpaces: home.totalSharedSpaces,
          hasFrontYard: home.hasFrontYard,
          hasBackyard: home.hasBackyard,
          hasSwimmingPool: home.hasSwimmingPool,
          maxCapacity: home.maxCapacity,
          status: home.status,
        })
      } else {
        reset({
          regionId: selectedRegionId === 'all' ? '' : selectedRegionId,
          streetAddress: '',
          suburb: '',
          state: '',
          postalCode: '',
          propertyType: '',
          sdaType: 'Not Applicable',
          totalRooms: 0,
          totalBathrooms: 0,
          totalKitchens: 0,
          totalParkingSpaces: 0,
          totalSharedSpaces: 0,
          hasFrontYard: false,
          hasBackyard: false,
          hasSwimmingPool: false,
          maxCapacity: 0,
          status: 'Active',
        })
      }
    }
  }, [open, mode, home, selectedRegionId, reset])

  const onSubmit = async (data: HomeCreateInput) => {
    try {
      if (mode === 'create') {
        await createHome.mutateAsync(data)
        toast.success('Home created successfully')
      } else {
        await updateHome.mutateAsync({ id: home.id, data })
        toast.success('Home updated successfully')
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Home' : 'Edit Home'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Street Address *</label>
                <Input {...register('streetAddress')} placeholder="123 Example St" />
                {errors.streetAddress && <p className="text-xs text-red-500">{errors.streetAddress.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Suburb *</label>
                <Input {...register('suburb')} placeholder="Sydney" />
                {errors.suburb && <p className="text-xs text-red-500">{errors.suburb.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">State *</label>
                <Select value={watch('state')} onValueChange={(v) => setValue('state', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Postal Code *</label>
                <Input {...register('postalCode')} placeholder="2000" />
                {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type *</label>
                <Select value={watch('propertyType')} onValueChange={(v) => setValue('propertyType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SDA Type</label>
                <Select value={watch('sdaType')} onValueChange={(v) => setValue('sdaType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SDA Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SDA_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rooms *</label>
                <Input type="number" {...register('totalRooms', { valueAsNumber: true })} />
                {errors.totalRooms && <p className="text-xs text-red-500">{errors.totalRooms.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bathrooms</label>
                <Input type="number" {...register('totalBathrooms', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kitchens</label>
                <Input type="number" {...register('totalKitchens', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parking Spaces</label>
                <Input type="number" {...register('totalParkingSpaces', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Shared Spaces</label>
                <Input type="number" {...register('totalSharedSpaces', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Capacity</label>
                <Input type="number" {...register('maxCapacity', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={watch('hasFrontYard')}
                  onCheckedChange={(checked) => setValue('hasFrontYard', checked as boolean)}
                />
                <span className="text-sm">Front Yard</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={watch('hasBackyard')}
                  onCheckedChange={(checked) => setValue('hasBackyard', checked as boolean)}
                />
                <span className="text-sm">Backyard</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={watch('hasSwimmingPool')}
                  onCheckedChange={(checked) => setValue('hasSwimmingPool', checked as boolean)}
                />
                <span className="text-sm">Swimming Pool</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={watch('status')} onValueChange={(v: 'Active' | 'Inactive') => setValue('status', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
