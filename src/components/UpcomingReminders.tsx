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

interface Reminder {
  id: string
  title: string
  due_date: string
  amount: number
}

interface UpcomingRemindersProps {
  reminders: Reminder[]
}

export default function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Lembretes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell
                  className={cn(
                    isOverdue(reminder.due_date) && 'text-red-500 font-medium'
                  )}
                >
                  {reminder.title}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-slate-400',
                    isOverdue(reminder.due_date) && 'text-red-500 font-medium'
                  )}
                >
                  {formatDate(reminder.due_date)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(reminder.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
