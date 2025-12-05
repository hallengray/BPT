'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteConfirmationDialogProps {
  itemType: string
  itemDescription?: string
  onConfirm: () => Promise<void>
  trigger?: React.ReactNode
  variant?: 'icon' | 'button'
  className?: string
}

export function DeleteConfirmationDialog({
  itemType,
  itemDescription,
  onConfirm,
  trigger,
  variant = 'icon',
  className,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultTrigger = variant === 'icon' ? (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 text-muted-foreground hover:text-destructive transition-colors',
        className
      )}
      onClick={() => setOpen(true)}
      aria-label={`Delete ${itemType}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      variant="destructive"
      size="sm"
      className={className}
      onClick={() => setOpen(true)}
      aria-label={`Delete ${itemType}`}
    >
      <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
      Delete
    </Button>
  )

  return (
    <>
      {trigger || defaultTrigger}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemType}?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemDescription || `Are you sure you want to delete this ${itemType}?`}
              <br />
              <strong className="text-destructive">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

