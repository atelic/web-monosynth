import { createContext } from 'react'
import { SynthActionsContextValue } from './types'

export const SynthActionsContext = createContext<SynthActionsContextValue | null>(null)
