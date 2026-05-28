type Props = {
  on: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
};

export function Toggle({ on, onChange, disabled, 'aria-label': ariaLabel }: Props) {
  return (
    <button
      type="button"
      className={`lb-tgl ${on ? 'on' : ''}`}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={on}
    >
      <span className="lb-tgl-thumb" />
    </button>
  );
}
