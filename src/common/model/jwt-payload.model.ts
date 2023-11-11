import { AuthScope } from "../constant";

export class JwtPayload {
  readonly id: string;
  readonly scopes: Set<AuthScope>;
  readonly exp?: number;

  constructor(id: string, scopes: Array<AuthScope>, exp?: number) {
    this.id = id;
    this.scopes = new Set(scopes);
    this.exp = exp;
  }

  hasScope(scope: AuthScope) {
    return this.scopes.has(scope);
  }
}
