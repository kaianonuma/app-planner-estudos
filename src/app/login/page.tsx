'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { LogIn, Mail, Lock, AlertCircle, UserCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verifica se o Supabase está configurado
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
        toast.error('Supabase não configurado', {
          description: 'Configure suas credenciais do Supabase nas Configurações do Projeto → Integrações.',
          duration: 7000,
        })
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Mensagens de erro mais específicas
        if (error.message === 'Invalid login credentials') {
          toast.error('Email ou senha incorretos', {
            description: 'Verifique suas credenciais ou crie uma conta se ainda não tiver uma.',
            duration: 5000,
          })
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email não confirmado', {
            description: 'Verifique seu email para confirmar sua conta.',
            duration: 5000,
          })
        } else {
          toast.error('Erro ao fazer login', {
            description: error.message,
            duration: 5000,
          })
        }
        return
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!')
        // Aguarda um pouco para garantir que a sessão foi estabelecida
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      toast.error('Erro inesperado ao fazer login', {
        description: 'Verifique se o Supabase está configurado corretamente.',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestAccess = () => {
    // Marca no localStorage que o usuário está em modo convidado
    localStorage.setItem('guestMode', 'true')
    toast.success('Entrando como convidado', {
      description: 'Você terá acesso limitado. Crie uma conta para salvar seus dados!',
      duration: 4000,
    })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            スタディフロー
          </h1>
          <p className="text-gray-600">Seu planner de estudos inteligente</p>
        </div>

        {/* Login Card */}
        <Card className="border-purple-200/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-center">
              Digite seu email e senha para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Entrando...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Botão de Acesso como Convidado */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={handleGuestAccess}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Entrar como Convidado
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Não tem uma conta? </span>
              <Link
                href="/signup"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Cadastre-se
              </Link>
            </div>

            {/* Aviso sobre credenciais */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Problemas para fazer login?</strong><br />
                • Verifique se suas credenciais estão corretas<br />
                • Certifique-se de que o Supabase está configurado em Configurações → Integrações<br />
                • Se ainda não tem conta, clique em "Cadastre-se"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Ao continuar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  )
}
