// ── Auth & User Types ──────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isAdmin: boolean;
  isAdvisor: boolean;
  isInvestor: boolean;
  managedFundCode?: string;
  isAuthenticated: boolean;
}

export interface AuthTokenData {
  access_token?: string;
  refresh_token?: string;
  token?: string;
}

export interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  managedFundCode?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: AuthTokenData) => void;
  logout: () => Promise<void>;
}

// ── Theme Types ────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}
