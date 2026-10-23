import { StrictMode, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MotionConfig } from 'motion/react';
import type { i18n as I18n } from 'i18next';

export function Providers({ i18n, children }: { i18n: I18n; children: ReactNode }) {
  return (
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </I18nextProvider>
    </StrictMode>
  );
}
