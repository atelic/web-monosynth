import { Synth } from './components/Synth'
import { SynthProvider } from './context'
import { getFrequency } from './constants/frequencies'

function App() {
  return (
    <SynthProvider getFrequency={getFrequency}>
      <Synth />
    </SynthProvider>
  )
}

export default App
