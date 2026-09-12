import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface BusinessSettings {
  id: string
  name: string
  address: string | null
  phone: string | null
}

interface BusinessContextType {
  business: BusinessSettings | null
  loading: boolean
  updateBusiness: (fields: Partial<Pick<BusinessSettings, 'name' | 'address' | 'phone'>>) => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchBusiness() {
    setLoading(true)
    const { data } = await supabase.from('business_settings').select('*').limit(1).single()
    if (data) setBusiness(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBusiness()
  }, [])

  async function updateBusiness(fields: Partial<Pick<BusinessSettings, 'name' | 'address' | 'phone'>>) {
    if (!business) return
    const { data } = await supabase
      .from('business_settings')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', business.id)
      .select()
      .single()
    if (data) setBusiness(data)
  }

  return (
    <BusinessContext.Provider value={{ business, loading, updateBusiness }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) throw new Error('useBusiness must be used within BusinessProvider')
  return context
}