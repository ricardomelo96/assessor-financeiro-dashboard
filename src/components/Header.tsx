import React from 'react'
import { Bell, User, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo - left side */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-slate-100">
            Assessor Financeiro
          </h1>
        </div>

        {/* Right side - notifications and user menu */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-slate-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-100">
                    {user?.user_metadata?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs leading-none text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 focus:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
