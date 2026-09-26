export async function getMetadata() {
  const res = await fetch(`${process.env.API_URL}/api/metadata`, {
    next: { revalidate: 3600 }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch metadata')
  }
  
  const body = await res.json()
  return body.data   // sənin backend-in { data: {...} } formatında qaytardığına görə
}