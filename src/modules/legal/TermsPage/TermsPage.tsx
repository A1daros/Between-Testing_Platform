import { LegalDocument } from '../components/LegalDocument';
import { TERMS_SECTIONS } from '../../../data/legal.data';
import { ROUTES } from '../../../constants/routes';
import { usePageMeta } from '../../../hooks/usePageMeta';

export const TermsPage = () => {
  usePageMeta({
    title: 'Умови користування',
    description:
      'Умови користування сайтом школи англійської мови BETWEEN: акаунт, тести, результати та відповідальність.',
    path: ROUTES.terms,
  });

  return (
    <LegalDocument
      label='BETWEEN / TERMS'
      title='Умови користування'
      sections={TERMS_SECTIONS}
    />
  );
};
