import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    tenant_id: '1',
    type: 'expense',
    amount: 150.00,
    description: 'Supermercado Extra',
    category_id: '1',
    category_name: 'Alimentacao',
    date: '2024-12-15',
    created_at: '2024-12-15T10:30:00Z',
  },
  {
    id: '2',
    tenant_id: '1',
    type: 'income',
    amount: 5000.00,
    description: 'Salario',
    category_id: '2',
    category_name: 'Salario',
    date: '2024-12-10',
    created_at: '2024-12-10T08:00:00Z',
  },
  {
    id: '3',
    tenant_id: '1',
    type: 'expense',
    amount: 80.00,
    description: 'Uber',
    category_id: '3',
    category_name: 'Transporte',
    date: '2024-12-14',
    created_at: '2024-12-14T18:45:00Z',
  },
  {
    id: '4',
    tenant_id: '1',
    type: 'expense',
    amount: 1200.00,
    description: 'Aluguel',
    category_id: '4',
    category_name: 'Moradia',
    date: '2024-12-05',
    created_at: '2024-12-05T09:00:00Z',
  },
  {
    id: '5',
    tenant_id: '1',
    type: 'expense',
    amount: 120.00,
    description: 'Cinema',
    category_id: '5',
    category_name: 'Lazer',
    date: '2024-12-12',
    created_at: '2024-12-12T20:00:00Z',
  },
  {
    id: '6',
    tenant_id: '1',
    type: 'expense',
    amount: 200.00,
    description: 'Farmacia',
    category_id: '6',
    category_name: 'Saude',
    date: '2024-12-08',
    created_at: '2024-12-08T14:30:00Z',
  },
  {
    id: '7',
    tenant_id: '1',
    type: 'income',
    amount: 500.00,
    description: 'Freelance',
    category_id: '7',
    category_name: 'Renda Extra',
    date: '2024-12-13',
    created_at: '2024-12-13T16:00:00Z',
  },
  {
    id: '8',
    tenant_id: '1',
    type: 'expense',
    amount: 45.00,
    description: 'Padaria',
    category_id: '1',
    category_name: 'Alimentacao',
    date: '2024-12-16',
    created_at: '2024-12-16T07:30:00Z',
  },
  {
    id: '9',
    tenant_id: '1',
    type: 'expense',
    amount: 300.00,
    description: 'Internet e TV',
    category_id: '8',
    category_name: 'Outros',
    date: '2024-12-07',
    created_at: '2024-12-07T11:00:00Z',
  },
  {
    id: '10',
    tenant_id: '1',
    type: 'expense',
    amount: 60.00,
    description: 'App de Transporte',
    category_id: '3',
    category_name: 'Transporte',
    date: '2024-12-11',
    created_at: '2024-12-11T19:15:00Z',
  },
]

const mockCategories = [
  { id: '1', name: 'Alimentacao', type: 'expense' },
  { id: '2', name: 'Salario', type: 'income' },
  { id: '3', name: 'Transporte', type: 'expense' },
  { id: '4', name: 'Moradia', type: 'expense' },
  { id: '5', name: 'Lazer', type: 'expense' },
  { id: '6', name: 'Saude', type: 'expense' },
  { id: '7', name: 'Renda Extra', type: 'income' },
  { id: '8', name: 'Outros', type: 'expense' },
]

export default function Transactions() {
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
  })

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === 'all' || transaction.type === filterType
    const categoryMatch =
      filterCategory === 'all' || transaction.category_id === filterCategory
    const searchMatch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    return typeMatch && categoryMatch && searchMatch
  })

  const handleCreateTransaction = () => {
    // In real app, this would call an API
    console.log('Creating transaction:', newTransaction)
    setIsDialogOpen(false)
    // Reset form
    setNewTransaction({
      type: 'expense',
      amount: '',
      description: '',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const availableCategories = mockCategories.filter(
    (cat) => newTransaction.type === 'income' ? cat.type === 'income' : cat.type === 'expense'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Transacoes</h1>
          <p className="text-slate-400 mt-1">Gerencie suas transacoes financeiras</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transacao
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transacao</DialogTitle>
              <DialogDescription>
                Adicione uma nova transacao ao seu registro financeiro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Type */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <RadioGroup
                  value={newTransaction.type}
                  onValueChange={(value) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: value as 'income' | 'expense',
                      category_id: '', // Reset category when type changes
                    })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="font-normal cursor-pointer">
                      Receita
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="font-normal cursor-pointer">
                      Despesa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, amount: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Input
                  id="description"
                  placeholder="Ex: Compras no supermercado"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newTransaction.category_id}
                  onValueChange={(value) =>
                    setNewTransaction({ ...newTransaction, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-700"
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateTransaction} className="bg-blue-600 hover:bg-blue-700">
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por descricao..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transacoes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400">
                    Nenhuma transacao encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category_name}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === 'income'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
