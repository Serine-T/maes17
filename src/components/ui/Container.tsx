import type { ComponentPropsWithoutRef, ElementType } from 'react';

type Props<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

export function Container<T extends ElementType = 'div'>({ as, className = '', ...rest }: Props<T>) {
  const Tag = as ?? 'div';
  return <Tag className={`container-wide ${className}`} {...rest} />;
}
