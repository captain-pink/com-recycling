import { AuthScope } from "../constant";

export class JwtPayload {
  readonly username: string;
  readonly scopes: Set<AuthScope>;
  readonly exp?: number;

  constructor(username: string, scopes: Array<AuthScope>, exp?: number) {
    this.username = username;
    this.scopes = new Set(scopes);
    this.exp = exp;
  }

  hasScope(scope: AuthScope) {
    return this.scopes.has(scope);
  }
}
