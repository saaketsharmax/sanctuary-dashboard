'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sanctuary/ui'
import { useState } from 'react'
import {
  CREDIT_CATEGORIES,
  CREDIT_SERVICES,
  type TransactionType,
  type CreditCategory,
  type CreditService,
  formatInvestmentCurrency,
} from '@/types'
import { Loader2 } from 'lucide-react'

interface RequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investmentId: string
  defaultType?: TransactionType
  creditsByCategory?: Partial<Record<CreditCategory, number>>
  pendingByCategory?: Partial<Record<CreditCategory, number>>
  totalCreditsCents?: number
  prefilledService?: CreditService | null
  onSubmit: (data: {
    investmentId: string
    type: TransactionType
    creditCategory: CreditCategory | null
    amountCents: number
    title: string
    description: string
  }) => Promise<void>
}

export function RequestDialog({
  open,
  onOpenChange,
  investmentId,
  defaultType = 'cash_disbursement',
  creditsByCategory,
  pendingByCategory,
  totalCreditsCents,
  prefilledService,
  onSubmit,
}: RequestDialogProps) {
  const [type, setType] = useState<TransactionType>(defaultType)
  const [creditCategory, setCreditCategory] = useState<CreditCategory | ''>('')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Apply prefilled service when it changes
  const [lastPrefill, setLastPrefill] = useState<string | null>(null)
  if (prefilledService && prefilledService.id !== lastPrefill) {
    setLastPrefill(prefilledService.id)
    setType('credit_usage')
    setCreditCategory(prefilledService.category)
    setAmount(String(prefilledService.typicalPriceCents / 100))
    setTitle(prefilledService.name)
    setDescription(prefilledService.description)
  }

  const resetForm = () => {
    setType(defaultType)
    setCreditCategory('')
    setAmount('')
    setTitle('')
    setDescription('')
    setError(null)
    setLastPrefill(null)
  }

  const handleSubmit = async () => {
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount greater than $0')
      return
    }

    if (type === 'credit_usage' && !creditCategory) {
      setError('Select a credit category')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        investmentId,
        type,
        creditCategory: type === 'credit_usage' ? (creditCategory as CreditCategory) : null,
        amountCents: Math.round(amountNum * 100),
        title: title.trim(),
        description: description.trim(),
      })
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'cash_disbursement' ? 'Request Cash Disbursement' : 'Request Credit Usage'}
          </DialogTitle>
          <DialogDescription>
            Submit a request for partner approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_disbursement">Cash Disbursement</SelectItem>
                <SelectItem value="credit_usage">Credit Usage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Credit Category (only for credit_usage) */}
          {type === 'credit_usage' && (
            <div className="space-y-2">
              <Label>Credit Category</Label>
              <Select value={creditCategory} onValueChange={(v) => setCreditCategory(v as CreditCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Spending Context + Service Suggestions */}
          {type === 'credit_usage' && creditCategory && creditsByCategory && (
            <div className="rounded-md bg-muted/50 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {CREDIT_CATEGORIES.find((c) => c.value === creditCategory)?.label} spent
                </span>
                <span className="font-medium text-foreground">
                  {formatInvestmentCurrency(creditsByCategory[creditCategory as CreditCategory] || 0)}
                  {(pendingByCategory?.[creditCategory as CreditCategory] ?? 0) > 0 && (
                    <> + {formatInvestmentCurrency(pendingByCategory![creditCategory as CreditCategory]!)} pending</>
                  )}
                </span>
              </div>
              {/* Suggested services for this category */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CREDIT_SERVICES.filter((s) => s.category === creditCategory).map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setAmount(String(svc.typicalPriceCents / 100))
                      setTitle(svc.name)
                      setDescription(svc.description)
                      setLastPrefill(svc.id)
                    }}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 hover:bg-accent transition-colors"
                  >
                    <span>{svc.name}</span>
                    <span className="text-muted-foreground">{svc.priceRange}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Office space deposit"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about this request..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
