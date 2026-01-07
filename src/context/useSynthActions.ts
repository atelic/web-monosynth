import { useContext } from 'react'
import { SynthActionsContext } from './SynthActionsContext'
import { SynthActionsContextValue } from './types'

export function useSynthActions(): SynthActionsContextValue {
  const context = useContext(SynthActionsContext)
  if (!context) {
    throw new Error('useSynthActions must be used within a SynthProvider')
  }
  return context
}
