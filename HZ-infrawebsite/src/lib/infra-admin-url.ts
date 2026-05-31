/** Public Infra admin base URL (ops / developer portal). */
export function getInfraAdminUrl(): string {
  return (process.env.NEXT_PUBLIC_INFRA_ADMIN_URL || 'http://localhost:3003').replace(/\/$/, '');
}

export function infraAdminPath(path: string): string {
  const base = getInfraAdminUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
