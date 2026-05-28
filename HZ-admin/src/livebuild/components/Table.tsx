import { ReactNode } from 'react';

type Props = {
  headers: ReactNode[];
  children: ReactNode;
  className?: string;
};

export function Table({ headers, children, className = '' }: Props) {
  return (
    <table className={`lb-tbl ${className}`.trim()}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
