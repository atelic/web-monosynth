import { useContext } from 'react'
import { SynthContext, SynthContextValue } from './SynthContextType'

export function useSynth(): SynthContextValue {
  const context = useContext(SynthContext)
  if (!context) {
    throw new Error('useSynth must be used within a SynthProvider')
  }
  return context
}
