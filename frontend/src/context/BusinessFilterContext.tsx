import { createContext, useContext, useState, type ReactNode } from 'react'

export type BusinessFilter = 'all' | 'plastik' | 'sembako'

interface BusinessFilterContextType {
  filter: BusinessFilter
  setFilter: (filter: BusinessFilter) => void
}

const BusinessFilterContext = createContext<BusinessFilterContextType | undefined>(undefined)

export function BusinessFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<BusinessFilter>('all')

  return (
    <BusinessFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </BusinessFilterContext.Provider>
  )
}

export function useBusinessFilter() {
  const context = useContext(BusinessFilterContext)
  if (!context) throw new Error('useBusinessFilter must be used within BusinessFilterProvider')
  return context
}