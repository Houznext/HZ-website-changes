export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  kind?: string;
  activeBranchId?: string;
}
