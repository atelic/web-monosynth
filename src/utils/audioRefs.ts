export function assertAudioNode<T>(
  ref: T | null,
  name: string
): asserts ref is T {
  if (ref === null) {
    throw new Error(`Audio node "${name}" not initialized. Call initializeAudio() first.`)
  }
}

export function getAudioNode<T>(ref: T | null): T | undefined {
  return ref ?? undefined
}

export function isAudioInitialized(
  refs: Record<string, unknown | null>
): boolean {
  return Object.values(refs).every(ref => ref !== null)
}
