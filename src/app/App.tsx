import { Route, Routes } from 'react-router';
import { LocaleLayout } from '@/components/layout/LocaleLayout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { FaqPage } from '@/pages/FaqPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RootRedirect } from './RootRedirect';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path=":lang" element={<LocaleLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:slug" element={<ServiceDetailPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
