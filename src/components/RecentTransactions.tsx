import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-slate-400">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-slate-400">
                  {transaction.category}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium',
                    transaction.type === 'income'
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
