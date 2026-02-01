import { redirect } from 'next/navigation'

// Redirect to unified mentor matching page
export default function PartnerMatchesPage() {
  redirect('/partner/mentors')
}
