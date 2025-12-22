import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BudgetProgress } from '@/components/BudgetProgress'
import { Plus, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth, useBudgets, useCategories, useToast } from '@/hooks'

export default function Budgets() {
  const { tenantPhone, loading: authLoading } = useAuth()
  const { budgets, loading: budgetsLoading, error: budgetsError, createBudget } = useBudgets(tenantPhone)
  const { expenseCategories, loading: categoriesLoading } = useCategories(tenantPhone)
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category_name: '',
    monthly_limit: '',
    alert_threshold: '80',
  })

  // Show errors as toasts
  useEffect(() => {
    if (budgetsError) {
      toast({ title: 'Erro ao carregar orçamentos', description: budgetsError, variant: 'destructive' })
    }
  }, [budgetsError, toast])

  const isLoading = authLoading || budgetsLoading || categoriesLoading

  const handleCreateBudget = async () => {
    if (!newBudget.category_name || !newBudget.monthly_limit) {
      toast({ title: 'Erro', description: 'Selecione uma categoria e defina o limite', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    const result = await createBudget(
      newBudget.category_name,
      parseFloat(newBudget.monthly_limit),
      parseFloat(newBudget.alert_threshold) / 100
    )
    setIsSubmitting(false)

    if (result.success) {
      toast({ title: 'Sucesso', description: 'Orcamento criado com sucesso' })
      setIsDialogOpen(false)
      setNewBudget({ category_name: '', monthly_limit: '', alert_threshold: '80' })
    } else {
      toast({ title: 'Erro', description: result.error || 'Erro ao criar orcamento', variant: 'destructive' })
    }
  }

  const { okBudgets, warningBudgets, exceededBudgets, totalSpent, totalLimit } = useMemo(() => ({
    okBudgets: budgets.filter(b => b.alert_level === 'OK'),
    warningBudgets: budgets.filter(b => b.alert_level === 'WARNING'),
    exceededBudgets: budgets.filter(b => b.alert_level === 'EXCEEDED'),
    totalSpent: budgets.reduce((sum, b) => sum + b.current_spent, 0),
    totalLimit: budgets.reduce((sum, b) => sum + b.monthly_limit, 0),
  }), [budgets])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Orçamentos</h1>
          <p className="text-slate-400 mt-1">Gerencie seus orçamentos mensais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orcamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Orcamento</DialogTitle>
              <DialogDescription>
                Defina um limite de gastos para uma categoria
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newBudget.category_name}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite Mensal (R$)</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="Ex: 500"
                  value={newBudget.monthly_limit}
                  onChange={(e) => setNewBudget({ ...newBudget, monthly_limit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Alerta em (%)</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="Ex: 80"
                  value={newBudget.alert_threshold}
                  onChange={(e) => setNewBudget({ ...newBudget, alert_threshold: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBudget} disabled={isSubmitting}>
                {isSubmitting ? (
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Dentro do Orçamento
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{okBudgets.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {okBudgets.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Próximo do Limite
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{warningBudgets.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {warningBudgets.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Orçamento Excedido
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{exceededBudgets.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {exceededBudgets.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Gasto</span>
              <span className="font-semibold text-slate-50">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Orçamento Total</span>
              <span className="font-semibold text-slate-50">
                R$ {totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-700 pt-2 mt-2">
              <span className="text-slate-400">Restante</span>
              <span
                className={`font-semibold ${
                  totalLimit - totalSpent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                R${' '}
                {Math.abs(totalLimit - totalSpent).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Progress Cards */}
      <div>
        <h2 className="text-xl font-semibold text-slate-50 mb-4">
          Orçamentos por Categoria
        </h2>
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-slate-400">
                Nenhum orçamento cadastrado. Clique em "Novo Orçamento" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget) => (
              <BudgetProgress
                key={budget.id}
                category={budget.category_name}
                spent={budget.current_spent}
                limit={budget.monthly_limit}
                alertLevel={budget.alert_level}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {(warningBudgets.length > 0 || exceededBudgets.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exceededBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg"
                >
                  <TrendingUp className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      Orçamento excedido em {budget.category_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Você gastou R${' '}
                      {(budget.current_spent - budget.monthly_limit).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      a mais que o planejado.
                    </p>
                  </div>
                </div>
              ))}
              {warningBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">
                      Próximo do limite em {budget.category_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Você já gastou{' '}
                      {((budget.current_spent / budget.monthly_limit) * 100).toFixed(1)}% do
                      orçamento desta categoria.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
