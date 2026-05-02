const MEDICAL_KEYWORDS = [
  'fever', 'cold', 'flu', 'headache', 'migraine', 'diabetes', 'hypertension',
  'blood pressure', 'asthma', 'allergy', 'anxiety', 'back pain', 'dehydration',
  'covid', 'coronavirus', 'symptoms', 'treatment', 'medication', 'infection',
  'inflammation', 'chronic', 'acute', 'diagnosis', 'prevention', 'vaccine',
  'antibiotic', 'antiviral', 'immune', 'respiratory', 'cardiovascular',
  'insulin', 'glucose', 'blood sugar', 'cholesterol', 'obesity', 'BMI',
  'therapy', 'surgery', 'emergency', 'urgent', 'consult', 'doctor', 'physician',
]

export function highlightKeywords(text) {
  if (!text) return text
  let result = text
  const sorted = [...MEDICAL_KEYWORDS].sort((a, b) => b.length - a.length)
  sorted.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(regex, `<mark class="keyword-highlight">$1</mark>`)
  })
  return result
}
