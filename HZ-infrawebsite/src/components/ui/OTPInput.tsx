import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export function OTPInput({ value, onChange, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = (value + '      ').slice(0, 6).split('');

  const setAt = (i: number, ch: string) => {
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = ch;
    onChange(arr.join('').replace(/ /g, '').slice(0, 6));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) refs.current[i - 1]?.focus();
      setAt(i, '');
    } else if (/^[0-9]$/.test(e.key)) {
      setAt(i, e.key);
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(t);
  };

  return (
    <div className="flex gap-2" onPaste={onPaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          disabled={disabled}
          maxLength={1}
          inputMode="numeric"
          className="h-12 w-11 rounded-lg border border-border text-center font-montserrat text-lg font-bold text-charcoal outline-none focus:border-hz-blue focus:ring-2 focus:ring-hz-blue/20"
          value={digits[i]?.trim() ? digits[i] : ''}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, '').slice(-1);
            if (ch) {
              setAt(i, ch);
              if (i < 5) refs.current[i + 1]?.focus();
            } else setAt(i, '');
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
        />
      ))}
    </div>
  );
}
