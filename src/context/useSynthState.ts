import { useContext } from 'react'
import { SynthStateContext } from './SynthStateContext'
import { SynthStateContextValue } from './types'

export function useSynthState(): SynthStateContextValue {
  const context = useContext(SynthStateContext)
  if (!context) {
    throw new Error('useSynthState must be used within a SynthProvider')
  }
  return context
}
