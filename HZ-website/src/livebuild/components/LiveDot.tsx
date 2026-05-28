type Props = {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function LiveDot({ color, className = '', style }: Props) {
  return (
    <span
      className={`live-dot ${className}`.trim()}
      style={{ ...(color ? { background: color } : {}), ...style }}
    />
  );
}
