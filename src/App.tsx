import { Synth } from './components/Synth'
import { SynthProvider } from './context'
import { AudioErrorBoundary } from './components/ErrorBoundary'
import { getFrequency } from './constants/frequencies'

function App() {
  return (
    <AudioErrorBoundary>
      <SynthProvider getFrequency={getFrequency}>
        <Synth />
      </SynthProvider>
    </AudioErrorBoundary>
  )
}

export default App
