import { createContext } from 'react'
import { SynthStateContextValue } from './types'

export const SynthStateContext = createContext<SynthStateContextValue | null>(null)
