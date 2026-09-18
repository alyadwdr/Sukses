import { createContext, useContext, useState, type ReactNode } from 'react'

interface MoreMenuContextType {
  open: boolean
  openMore: () => void
  closeMore: () => void
}

const MoreMenuContext = createContext<MoreMenuContextType | undefined>(undefined)

export function MoreMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <MoreMenuContext.Provider value={{ open, openMore: () => setOpen(true), closeMore: () => setOpen(false) }}>
      {children}
    </MoreMenuContext.Provider>
  )
}

export function useMoreMenu() {
  const context = useContext(MoreMenuContext)
  if (!context) throw new Error('useMoreMenu must be used within MoreMenuProvider')
  return context
}