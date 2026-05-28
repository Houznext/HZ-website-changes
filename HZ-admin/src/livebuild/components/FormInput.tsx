import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; options?: { value: string; label: string }[] };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

type Props = InputProps | SelectProps | TextareaProps;

export function FormInput(props: Props) {
  const { className = '', ...rest } = props;
  const cls = `lb-fi ${className}`.trim();

  if (props.as === 'select') {
    const { options, children, ...sel } = rest as SelectProps;
    return (
      <select className={cls} {...sel}>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
    );
  }

  if (props.as === 'textarea') {
    const { as: _a, ...ta } = rest as TextareaProps;
    return <textarea className={cls} {...ta} />;
  }

  const { as: _a, ...inp } = rest as InputProps;
  return <input className={cls} {...inp} />;
}
