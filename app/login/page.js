'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/booking'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await login(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/agenda')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Acceso Administrador</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Contraseña</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
