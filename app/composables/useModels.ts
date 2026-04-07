export function formatModelName(modelId: string): string {
  const acronyms = ['ai', 'ia'] // acronymes en majuscules
  const modelName = modelId.split('/')[1] || modelId

  return modelName
    .split('-')
    .map((word) => {
      const lowerWord = word.toLowerCase()
      return acronyms.includes(lowerWord)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function useModels() {
  const models = [
    'eduai/chatme-1',
    'eduai/chatme-coder',
    'eduai/chatme-pro'
  ]

  const model = useCookie<string>('model', { default: () => 'eduai/chatme-1' })

  // À AJOUTER PLUS TARD - mapping des logos
  // const modelLogos = {
  //   'eduai/chatme-1': '/logos/chatme-1.svg',
  //   'eduai/chatme-coder': '/logos/chatme-coder.svg',
  //   'eduai/chatme-pro': '/logos/chatme-pro.svg'
  // }

  return {
    models,
    model,
    formatModelName
    // modelLogos // À décommenter plus tard
  }
}