import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Bell,
  DollarSign,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // Mock user data - in a real app, this would come from auth context or Supabase
  const userData = {
    name: 'Ricardo Melo',
    email: 'ricardo@exemplo.com',
    phone: '+55 (11) 98765-4321',
    memberSince: '2023-01-15',
    initials: 'RM',
  }

  // Mock preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    budgetAlerts: true,
    reminderAlerts: true,
    monthlyReports: true,
  })

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatMemberSince = (date: string) => {
    const memberDate = new Date(date)
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    return `${months[memberDate.getMonth()]} de ${memberDate.getFullYear()}`
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie suas preferências e informações da conta</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-blue-500 text-white">
                {userData.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="h-4 w-4" />
                    <span>Nome</span>
                  </div>
                  <p className="text-slate-50 font-medium">{userData.name}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="text-slate-50 font-medium">{userData.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>Telefone</span>
                  </div>
                  <p className="text-slate-50 font-medium">{userData.phone}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde</span>
                  </div>
                  <p className="text-slate-50 font-medium">
                    {formatMemberSince(userData.memberSince)}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="mt-4">
                Editar Perfil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-slate-50">
                Notificações por Email
              </label>
              <p className="text-xs text-slate-400">
                Receba atualizações e alertas por email
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-slate-50">
                Notificações Push
              </label>
              <p className="text-xs text-slate-400">
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-slate-50">
                Alertas de Orçamento
              </label>
              <p className="text-xs text-slate-400">
                Seja notificado quando atingir limites de orçamento
              </p>
            </div>
            <Switch
              checked={preferences.budgetAlerts}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, budgetAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-slate-50">
                Alertas de Lembretes
              </label>
              <p className="text-xs text-slate-400">
                Receba lembretes de pagamentos próximos
              </p>
            </div>
            <Switch
              checked={preferences.reminderAlerts}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, reminderAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-slate-50">
                Relatórios Mensais
              </label>
              <p className="text-xs text-slate-400">
                Receba resumos mensais das suas finanças
              </p>
            </div>
            <Switch
              checked={preferences.monthlyReports}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, monthlyReports: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Formato de Moeda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-50 block mb-2">
                Moeda Padrão
              </label>
              <select
                className="w-full md:w-64 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="BRL"
              >
                <option value="BRL">Real (BRL) - R$</option>
                <option value="USD">Dólar (USD) - $</option>
                <option value="EUR">Euro (EUR) - €</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-50 block mb-2">
                Formato de Data
              </label>
              <select
                className="w-full md:w-64 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="pt-BR"
              >
                <option value="pt-BR">DD/MM/AAAA</option>
                <option value="en-US">MM/DD/AAAA</option>
                <option value="iso">AAAA-MM-DD</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <SettingsIcon className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-50">Sair da Conta</p>
              <p className="text-xs text-slate-400 mt-1">
                Fazer logout da sua conta
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
