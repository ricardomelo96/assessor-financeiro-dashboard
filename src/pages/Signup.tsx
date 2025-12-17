import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        setSuccess(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-50 mb-2">
              Assessor Financeiro
            </h1>
            <p className="text-slate-400 text-sm">
              Crie sua conta para começar
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">
                Conta criada com sucesso! Verifique seu email para ativar a conta.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-50 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-50 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-400">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-50 mb-2"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          {/* Additional Info */}
          {success && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
              <p className="text-blue-400 text-xs">
                Nota: Sua conta será vinculada ao tenant Kiwify existente via email.
              </p>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
