'use client'

import { useState, useMemo, useCallback } from 'react'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  Heart,
  Calendar,
  Filter,
  X,
  FileText,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { DateRangeSelector } from '@/components/analytics/date-range-selector'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { deleteBPReading } from '@/app/actions/bp-readings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  classifyBloodPressure,
  getBPClassificationLabel,
  getBPClassificationColor,
  type BloodPressureReading,
  type BPClassification,
} from '@/types'
import { calculateDescriptiveStatistics } from '@/lib/statistics'

interface HistoryContentProps {
  initialReadings: BloodPressureReading[]
  totalCount: number
  firstReadingDate: string | null
}

type SortField = 'measured_at' | 'systolic' | 'diastolic' | 'pulse'
type SortDirection = 'asc' | 'desc'

const CLASSIFICATION_OPTIONS: { value: BPClassification | 'all'; label: string }[] = [
  { value: 'all', label: 'All Classifications' },
  { value: 'normal', label: 'Normal' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'high_stage_1', label: 'High (Stage 1)' },
  { value: 'high_stage_2', label: 'High (Stage 2)' },
  { value: 'hypertensive_crisis', label: 'Hypertensive Crisis' },
]

export function HistoryContent({
  initialReadings,
  totalCount,
  firstReadingDate,
}: HistoryContentProps) {
  const router = useRouter()

  // Filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>()
  const [classificationFilter, setClassificationFilter] = useState<BPClassification | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<SortField>('measured_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter and sort readings
  const filteredReadings = useMemo(() => {
    let result = [...initialReadings]

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      result = result.filter((reading) => {
        const readingDate = parseISO(reading.measured_at)
        return isWithinInterval(readingDate, {
          start: startOfDay(dateRange.from!),
          end: endOfDay(dateRange.to!),
        })
      })
    }

    // Filter by classification
    if (classificationFilter !== 'all') {
      result = result.filter((reading) => {
        const classification = classifyBloodPressure(reading.systolic, reading.diastolic)
        return classification === classificationFilter
      })
    }

    // Filter by search query (notes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (reading) =>
          reading.notes?.toLowerCase().includes(query) ||
          reading.systolic.toString().includes(query) ||
          reading.diastolic.toString().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'measured_at':
          comparison = new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
          break
        case 'systolic':
          comparison = a.systolic - b.systolic
          break
        case 'diastolic':
          comparison = a.diastolic - b.diastolic
          break
        case 'pulse':
          comparison = a.pulse - b.pulse
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [initialReadings, dateRange, classificationFilter, searchQuery, sortField, sortDirection])

  // Calculate statistics for filtered data
  const stats = useMemo(() => {
    if (filteredReadings.length === 0) return null

    const systolicValues = filteredReadings.map((r) => r.systolic)
    const diastolicValues = filteredReadings.map((r) => r.diastolic)

    return {
      systolic: calculateDescriptiveStatistics(systolicValues),
      diastolic: calculateDescriptiveStatistics(diastolicValues),
      count: filteredReadings.length,
    }
  }, [filteredReadings])

  // Pagination
  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredReadings.slice(start, start + itemsPerPage)
  }, [filteredReadings, currentPage])

  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage)

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        return field
      }
      setSortDirection('desc')
      return field
    })
  }, [])

  // Handle delete
  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteBPReading(id)
      if (result.success) {
        toast.success('Reading deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete reading')
      }
    },
    [router]
  )

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = ['Date', 'Time', 'Systolic', 'Diastolic', 'Pulse', 'Classification', 'Notes']
    const rows = filteredReadings.map((reading) => {
      const date = parseISO(reading.measured_at)
      const classification = classifyBloodPressure(reading.systolic, reading.diastolic)
      return [
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm'),
        reading.systolic.toString(),
        reading.diastolic.toString(),
        reading.pulse.toString(),
        getBPClassificationLabel(classification),
        reading.notes || '',
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bp-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()

    toast.success('History exported successfully')
  }, [filteredReadings])

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setDateRange(undefined)
    setSelectedPreset(undefined)
    setClassificationFilter('all')
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  const hasActiveFilters = dateRange || classificationFilter !== 'all' || searchQuery

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard>
        <GlassCardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Date Range */}
              <div className="w-full md:w-auto md:min-w-[300px]">
                <DateRangeSelector
                  value={dateRange}
                  onChange={(range) => {
                    setDateRange(range)
                    setCurrentPage(1)
                  }}
                  selectedPreset={selectedPreset}
                  onPresetChange={setSelectedPreset}
                  maxDate={new Date()}
                  minDate={firstReadingDate ? parseISO(firstReadingDate) : undefined}
                />
              </div>

              {/* Classification Filter */}
              <Select
                value={classificationFilter}
                onValueChange={(value) => {
                  setClassificationFilter(value as BPClassification | 'all')
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Classification" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative flex-1 md:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notes or values..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredReadings.length} of {totalCount} readings</span>
                {dateRange?.from && dateRange?.to && (
                  <Badge variant="secondary">
                    {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                  </Badge>
                )}
                {classificationFilter !== 'all' && (
                  <Badge variant="secondary">
                    {CLASSIFICATION_OPTIONS.find((o) => o.value === classificationFilter)?.label}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary">Search: &quot;{searchQuery}&quot;</Badge>
                )}
              </div>
            )}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard>
            <GlassCardContent className="p-4">
              <p className="text-sm text-muted-foreground">Readings</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4">
              <p className="text-sm text-muted-foreground">Avg Systolic</p>
              <p className="text-2xl font-bold">
                {stats.systolic.mean.toFixed(0)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ±{stats.systolic.standardDeviation.toFixed(1)}
                </span>
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4">
              <p className="text-sm text-muted-foreground">Avg Diastolic</p>
              <p className="text-2xl font-bold">
                {stats.diastolic.mean.toFixed(0)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ±{stats.diastolic.standardDeviation.toFixed(1)}
                </span>
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4">
              <p className="text-sm text-muted-foreground">Range</p>
              <p className="text-2xl font-bold">
                {stats.systolic.min.toFixed(0)}-{stats.systolic.max.toFixed(0)}
                <span className="mx-1 text-sm font-normal text-muted-foreground">/</span>
                {stats.diastolic.min.toFixed(0)}-{stats.diastolic.max.toFixed(0)}
              </p>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}

      {/* Readings Table */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <GlassCardTitle>Blood Pressure Readings</GlassCardTitle>
              <GlassCardDescription>
                {firstReadingDate
                  ? `Tracking since ${format(parseISO(firstReadingDate), 'MMMM d, yyyy')}`
                  : 'Start logging to build your history'}
              </GlassCardDescription>
            </div>
            <Badge variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              {totalCount} total
            </Badge>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {filteredReadings.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Heart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="font-medium">No readings found</p>
                <p className="text-sm">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Start logging your blood pressure'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <SortableHeader
                        label="Date & Time"
                        field="measured_at"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Systolic"
                        field="systolic"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Diastolic"
                        field="diastolic"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Pulse"
                        field="pulse"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Classification
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Notes</th>
                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReadings.map((reading) => {
                      const classification = classifyBloodPressure(
                        reading.systolic,
                        reading.diastolic
                      )
                      const date = parseISO(reading.measured_at)

                      return (
                        <tr
                          key={reading.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{format(date, 'MMM d, yyyy')}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(date, 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg font-bold">{reading.systolic}</span>
                            <span className="ml-1 text-sm text-muted-foreground">mmHg</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg font-bold">{reading.diastolic}</span>
                            <span className="ml-1 text-sm text-muted-foreground">mmHg</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg font-bold">{reading.pulse}</span>
                            <span className="ml-1 text-sm text-muted-foreground">bpm</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={cn(getBPClassificationColor(classification))}
                            >
                              {getBPClassificationLabel(classification)}
                            </Badge>
                          </td>
                          <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
                            {reading.notes || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <DeleteConfirmationDialog
                              itemType="BP Reading"
                              itemDescription={`${reading.systolic}/${reading.diastolic} mmHg on ${format(date, 'MMM d, yyyy')}`}
                              onConfirm={() => handleDelete(reading.id)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredReadings.length)} of{' '}
                    {filteredReadings.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page: number
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentField === field

  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {label}
        <span className="flex flex-col">
          <ChevronUp
            className={cn(
              'h-3 w-3 -mb-1',
              isActive && direction === 'asc' ? 'text-foreground' : 'text-muted-foreground/30'
            )}
          />
          <ChevronDown
            className={cn(
              'h-3 w-3',
              isActive && direction === 'desc' ? 'text-foreground' : 'text-muted-foreground/30'
            )}
          />
        </span>
      </button>
    </th>
  )
}

