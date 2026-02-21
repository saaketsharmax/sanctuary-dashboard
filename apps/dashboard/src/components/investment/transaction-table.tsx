'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CreditCategoryBadge } from './credit-category-badge'
import {
  formatInvestmentCurrency,
  type InvestmentTransaction,
  type CreditCategory,
} from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

interface TransactionTableProps {
  transactions: InvestmentTransaction[]
  showCompany?: boolean
  hideCategory?: boolean
  hideType?: boolean
  onCancel?: (transactionId: string) => void
  onApprove?: (transactionId: string) => void
  onDeny?: (transactionId: string) => void
}

export function TransactionTable({
  transactions,
  showCompany = false,
  hideCategory = false,
  hideType = false,
  onCancel,
  onApprove,
  onDeny,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showCompany && <TableHead>Company</TableHead>}
          <TableHead>Date</TableHead>
          <TableHead>Title</TableHead>
          {!hideType && <TableHead>Type</TableHead>}
          {!hideCategory && <TableHead>Category</TableHead>}
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          {(onCancel || onApprove || onDeny) && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn.id}>
            {showCompany && (
              <TableCell className="font-medium">
                {(txn as InvestmentTransaction & { companyName?: string }).companyName || '—'}
              </TableCell>
            )}
            <TableCell className="text-muted-foreground">
              {new Date(txn.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </TableCell>
            <TableCell className="font-medium">{txn.title}</TableCell>
            {!hideType && (
              <TableCell>
                <Badge variant="outline">
                  {txn.type === 'cash_disbursement' ? 'Cash' : 'Credit'}
                </Badge>
              </TableCell>
            )}
            {!hideCategory && (
              <TableCell>
                {txn.creditCategory ? (
                  <CreditCategoryBadge category={txn.creditCategory as CreditCategory} />
                ) : (
                  '—'
                )}
              </TableCell>
            )}
            <TableCell className="text-right font-mono">
              {formatInvestmentCurrency(txn.amountCents)}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[txn.status] || ''}>
                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
              </Badge>
            </TableCell>
            {(onCancel || onApprove || onDeny) && (
              <TableCell>
                <div className="flex gap-2">
                  {onCancel && txn.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(txn.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {onApprove && txn.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onApprove(txn.id)}
                    >
                      Approve
                    </Button>
                  )}
                  {onDeny && txn.status === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeny(txn.id)}
                    >
                      Deny
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
