import type { Metadata } from 'next'
import PartForm from '../_components/PartForm'

export const metadata: Metadata = {
  title: 'Ehtiyat hissəsi elanı yerləşdir',
  robots: { index: false, follow: false },
}

export default function NewPartPage() {
  return <PartForm />
}
