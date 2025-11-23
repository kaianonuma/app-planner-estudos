import { supabase } from './supabase'

export async function getCurrentUser() {
  // Primeiro verifica se existe uma sessão ativa
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }
  
  // Só tenta pegar o usuário se houver sessão
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
