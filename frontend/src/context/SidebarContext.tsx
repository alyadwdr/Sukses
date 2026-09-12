import { createContext, useContext, useState, type ReactNode } from 'react'

interface SidebarContextType {
  collapsed: boolean
  toggleCollapsed: () => void
  width: number
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggleCollapsed: () => setCollapsed((v) => !v),
        width: collapsed ? 76 : 240,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within SidebarProvider')
  return context
}