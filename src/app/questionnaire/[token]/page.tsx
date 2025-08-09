// src/app/questionnaire/[token]/page.tsx
import { Metadata } from 'next';
import QuestionnaireClient from '@/components/clients/QuestionnaireClient/QuestionnaireClient'

export const metadata: Metadata = {
  title: 'Complete Your Information | Toasted Sesame Therapy',
  description: 'Help us understand your needs better by completing this brief questionnaire.',
};

export default function QuestionnairePage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  return <QuestionnaireClient params={params} />;
}
