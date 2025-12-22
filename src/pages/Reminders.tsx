import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Calendar, DollarSign, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth, useReminders, useToast } from '@/hooks'
import type { Reminder } from '@/types'

export default function Reminders() {
  const { tenantPhone, loading: authLoading } = useAuth()
  const { pendingReminders, paidReminders, overdueReminders, loading: remindersLoading, error: remindersError, markAsPaid } = useReminders(tenantPhone)
  const { toast } = useToast()

  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMarking, setIsMarking] = useState(false)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    type: 'bill' as 'bill' | 'receivable' | 'custom',
  })

  // Show errors as toasts
  useEffect(() => {
    if (remindersError) {
      toast({ title: 'Erro ao carregar lembretes', description: remindersError, variant: 'destructive' })
    }
  }, [remindersError, toast])

  const isLoading = authLoading || remindersLoading

  const handleMarkAsPaid = (reminder: Reminder) => {
    setSelectedReminder(reminder)
    setIsDialogOpen(true)
  }

  const confirmMarkAsPaid = async () => {
    if (selectedReminder) {
      setIsMarking(true)
      const result = await markAsPaid(selectedReminder.title)
      setIsMarking(false)

      if (result.success) {
        toast({ title: 'Sucesso', description: 'Lembrete marcado como pago' })
      } else {
        toast({ title: 'Erro', description: result.error || 'Erro ao marcar como pago', variant: 'destructive' })
      }
    }
    setIsDialogOpen(false)
    setSelectedReminder(null)
  }

  const getStatusBadge = (reminder: Reminder) => {
    if (reminder.is_paid) {
      return <Badge variant="success">Pago</Badge>
    }
    const isOverdue = new Date(reminder.due_date) < new Date()
    if (isOverdue) {
      return <Badge variant="danger">Vencido</Badge>
    }
    return <Badge variant="warning">Pendente</Badge>
  }

  const handleCreateReminder = async () => {
    if (!newReminder.title || !newReminder.due_date) {
      toast({ title: 'Erro', description: 'Preencha o titulo e a data de vencimento', variant: 'destructive' })
      return
    }

    setIsCreating(true)
    try {
      const { error } = await supabase.rpc('create_reminder_from_agent', {
        p_phone: tenantPhone,
        p_title: newReminder.title,
        p_due_date: newReminder.due_date,
        p_amount: newReminder.amount ? parseFloat(newReminder.amount) : null,
        p_type: newReminder.type,
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Lembrete criado com sucesso' })
      setIsCreateDialogOpen(false)
      setNewReminder({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0], type: 'bill' })
      window.location.reload()
    } catch (err) {
      toast({ title: 'Erro', description: err instanceof Error ? err.message : 'Erro ao criar lembrete', variant: 'destructive' })
    } finally {
      setIsCreating(false)
    }
  }

  const ReminderCard = ({ reminder, showMarkButton = false }: { reminder: Reminder; showMarkButton?: boolean }) => (
    <Card className="hover:bg-slate-700/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-50">{reminder.title}</h3>
              {getStatusBadge(reminder)}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(reminder.due_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">{formatCurrency(reminder.amount)}</span>
              </div>
            </div>

            {reminder.category_name && (
              <div className="text-xs text-slate-500">{reminder.category_name}</div>
            )}
          </div>

          {showMarkButton && !reminder.is_paid && (
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Carregando lembretes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Lembretes</h1>
          <p className="text-slate-400 mt-1">Gerencie seus lembretes de pagamento</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lembrete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lembrete</DialogTitle>
              <DialogDescription>
                Adicione um lembrete para uma conta a pagar ou receber
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  placeholder="Ex: Conta de Luz"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) - Opcional</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 150"
                  value={newReminder.amount}
                  onChange={(e) => setNewReminder({ ...newReminder, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newReminder.due_date}
                  onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newReminder.type}
                  onValueChange={(value: 'bill' | 'receivable' | 'custom') => setNewReminder({ ...newReminder, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bill">Conta a Pagar</SelectItem>
                    <SelectItem value="receivable">Conta a Receber</SelectItem>
                    <SelectItem value="custom">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                Cancelar
              </Button>
              <Button onClick={handleCreateReminder} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <ReminderCard key={reminder.id} reminder={reminder} showMarkButton />
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
              <ReminderCard key={reminder.id} reminder={reminder} showMarkButton />
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
              disabled={isMarking}
            >
              Cancelar
            </Button>
            <Button onClick={confirmMarkAsPaid} disabled={isMarking}>
              {isMarking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
