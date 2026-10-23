import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { LocalizedLink } from './LocalizedLink';

export type ButtonVariant = 'solid' | 'outline' | 'onDark' | 'outlineOnDark' | 'signal';

const base =
  'group inline-flex min-h-12 items-center justify-center gap-3 px-6 text-[0.9375rem] font-medium tracking-[0.01em] transition-[background-color,color,border-color] duration-300 ease-[var(--ease-survey)] disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  solid: 'bg-graphite text-paper hover:bg-olive-deep',
  outline: 'border border-graphite/30 text-graphite hover:border-graphite hover:bg-graphite hover:text-paper',
  onDark: 'bg-paper text-graphite hover:bg-white',
  outlineOnDark: 'border border-paper/40 text-paper hover:border-paper hover:bg-paper/10',
  signal: 'bg-signal-deep text-white hover:bg-[#9c3f13]',
};

export function buttonClass(variant: ButtonVariant = 'solid', extra = ''): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

interface LinkButtonProps extends Omit<ComponentPropsWithoutRef<typeof LocalizedLink>, 'className'> {
  variant?: ButtonVariant;
  className?: string;
  icon?: ReactNode;
}

/** Internal navigation styled as a button. */
export function LinkButton({ variant = 'solid', className = '', icon, children, ...rest }: LinkButtonProps) {
  return (
    <LocalizedLink className={buttonClass(variant, className)} {...rest}>
      <span>{children}</span>
      {icon}
    </LocalizedLink>
  );
}

interface AnchorButtonProps extends ComponentPropsWithoutRef<'a'> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

/** External or protocol link (tel:, https://wa.me) styled as a button. */
export function AnchorButton({ variant = 'solid', className = '', icon, children, ...rest }: AnchorButtonProps) {
  return (
    <a className={buttonClass(variant, className)} {...rest}>
      {icon}
      <span>{children}</span>
    </a>
  );
}
