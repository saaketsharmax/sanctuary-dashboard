import { redirect } from 'next/navigation'

// Redirect to unified mentor matching page
export default function MatchesPage() {
  redirect('/mentors')
}
