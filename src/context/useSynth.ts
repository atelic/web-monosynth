import { useSynthState } from './useSynthState'
import { useSynthActions } from './useSynthActions'
import { SynthContextValue } from './types'

export function useSynth(): SynthContextValue {
  const state = useSynthState()
  const actions = useSynthActions()
  return { ...state, ...actions }
}
