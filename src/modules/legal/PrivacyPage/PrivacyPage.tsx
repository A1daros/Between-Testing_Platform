import { LegalDocument } from '../components/LegalDocument';
import { PRIVACY_SECTIONS } from '../../../data/legal.data';
import { ROUTES } from '../../../constants/routes';
import { usePageMeta } from '../../../hooks/usePageMeta';

export const PrivacyPage = () => {
  usePageMeta({
    title: 'Політика конфіденційності',
    description:
      'Як школа англійської мови BETWEEN збирає, використовує та захищає персональні дані учнів і відвідувачів сайту.',
    path: ROUTES.privacy,
  });

  return (
    <LegalDocument
      label='BETWEEN / PRIVACY'
      title='Політика конфіденційності'
      sections={PRIVACY_SECTIONS}
    />
  );
};
