import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Calendar, DollarSign, CheckCircle2 } from 'lucide-react'

interface MockReminder {
  id: string
  title: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  category?: string
}

// Mock data
const mockReminders: MockReminder[] = [
  { id: '1', title: 'Aluguel', amount: 1500, dueDate: '2024-01-05', status: 'pending', category: 'Moradia' },
  { id: '2', title: 'Conta de Luz', amount: 230, dueDate: '2024-01-10', status: 'pending', category: 'Utilidades' },
  { id: '3', title: 'Internet', amount: 120, dueDate: '2024-01-15', status: 'pending', category: 'Utilidades' },
  { id: '4', title: 'Cartão de Crédito', amount: 850, dueDate: '2024-01-20', status: 'pending', category: 'Finanças' },
  { id: '5', title: 'Academia', amount: 150, dueDate: '2024-01-25', status: 'pending', category: 'Saúde' },
  { id: '6', title: 'Netflix', amount: 45, dueDate: '2023-12-20', status: 'paid', category: 'Entretenimento' },
  { id: '7', title: 'Spotify', amount: 25, dueDate: '2023-12-15', status: 'paid', category: 'Entretenimento' },
  { id: '8', title: 'Seguro do Carro', amount: 320, dueDate: '2023-12-10', status: 'paid', category: 'Transporte' },
  { id: '9', title: 'Condomínio', amount: 450, dueDate: '2023-11-30', status: 'overdue', category: 'Moradia' },
  { id: '10', title: 'Conta de Água', amount: 80, dueDate: '2023-11-25', status: 'overdue', category: 'Utilidades' },
]

export default function Reminders() {
  const [reminders, setReminders] = useState<MockReminder[]>(mockReminders)
  const [selectedReminder, setSelectedReminder] = useState<MockReminder | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pendingReminders = reminders.filter(r => r.status === 'pending')
  const paidReminders = reminders.filter(r => r.status === 'paid')
  const overdueReminders = reminders.filter(r => r.status === 'overdue')

  const handleMarkAsPaid = (reminder: MockReminder) => {
    setSelectedReminder(reminder)
    setIsDialogOpen(true)
  }

  const confirmMarkAsPaid = () => {
    if (selectedReminder) {
      setReminders(prev =>
        prev.map(r =>
          r.id === selectedReminder.id ? { ...r, status: 'paid' } : r
        )
      )
    }
    setIsDialogOpen(false)
    setSelectedReminder(null)
  }

  const getStatusBadge = (status: MockReminder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>
      case 'paid':
        return <Badge variant="success">Pago</Badge>
      case 'overdue':
        return <Badge variant="danger">Vencido</Badge>
    }
  }

  const ReminderCard = ({ reminder }: { reminder: MockReminder }) => (
    <Card className="hover:bg-slate-700/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-50">{reminder.title}</h3>
              {getStatusBadge(reminder.status)}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(reminder.dueDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">{formatCurrency(reminder.amount)}</span>
              </div>
            </div>

            {reminder.category && (
              <div className="text-xs text-slate-500">{reminder.category}</div>
            )}
          </div>

          {reminder.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarkAsPaid(reminder)}
              className="ml-4"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar como Pago
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Lembretes</h1>
          <p className="text-slate-400 mt-1">Gerencie seus lembretes de pagamento</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({pendingReminders.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Pagos ({paidReminders.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Vencidos ({overdueReminders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Nenhum lembrete pendente</p>
              </CardContent>
            </Card>
          ) : (
            pendingReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4 mt-6">
          {paidReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Nenhum lembrete pago</p>
              </CardContent>
            </Card>
          ) : (
            paidReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4 mt-6">
          {overdueReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Nenhum lembrete vencido</p>
              </CardContent>
            </Card>
          ) : (
            overdueReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja marcar "{selectedReminder?.title}" como pago?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmMarkAsPaid}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
