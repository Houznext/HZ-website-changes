import { LabelHTMLAttributes, ReactNode } from 'react';

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  children: ReactNode;
};

export function Label({ required, children, className = '', ...rest }: Props) {
  return (
    <label
      className={`lb-lbl ${required ? 'lb-lbl-req' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </label>
  );
}
