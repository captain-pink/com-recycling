import { AuthScope } from "../constant";

export class JwtPayload {
  readonly email: string;
  readonly scopes: Set<AuthScope>;
  readonly exp?: number;

  constructor(email: string, scopes: Array<AuthScope>, exp?: number) {
    this.email = email;
    this.scopes = new Set(scopes);
    this.exp = exp;
  }

  hasScope(scope: AuthScope) {
    return this.scopes.has(scope);
  }
}
