/**
 * useGitHubOAuth.ts
 *
 * Manages GitHub OAuth connection state for the Repo Chat feature.
 * Supports public repos (no auth) and private repos (OAuth PAT via popup flow).
 *
 * Token storage: localStorage under "integri_github_token" / "integri_github_user".
 * OAuth exchange: Routes through GitHub OAuth App (GITHUB_CLIENT_ID).
 * The client secret MUST NOT be VITE_ prefixed — it stays server-side only.
 */

import { useState, useEffect, useCallback } from "react";
import { Octokit } from "octokit";

const STORAGE_KEY_TOKEN = "integri_github_token";
const STORAGE_KEY_USER = "integri_github_user";

// OAuth redirect URI — must match what's registered in GitHub OAuth App settings
const REDIRECT_URI = `${window.location.origin}/github/callback`;
const OAUTH_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

export function useGitHubOAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY_TOKEN)
  );
  const [user, setUser] = useState<GitHubUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = !!token && !!user;

  // ── 1. Validate stored token is still live ─────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const validate = async () => {
      try {
        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.rest.users.getAuthenticated();
        const ghUser: GitHubUser = {
          login: data.login,
          avatar_url: data.avatar_url,
          name: data.name,
        };
        setUser(ghUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(ghUser));
      } catch {
        // Token revoked or expired — clear storage
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
        setToken(null);
        setUser(null);
      }
    };

    validate();
  }, [token]);

  // ── 2. Handle OAuth callback (code in URL query params) ────────────────────
  // NOTE: Full server-side token exchange requires a backend /api/github/callback.
  // For public repo support (MVP), users can paste a PAT instead.
  // The callback detection below handles a future server-side exchange flow.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("github_code");
    const state = params.get("github_state");

    if (!code) return;

    const savedState = sessionStorage.getItem("github_oauth_state");
    if (state !== savedState) {
      console.warn("[GitHubOAuth] State mismatch — possible CSRF.");
      return;
    }

    // Clean URL
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("github_code");
    cleanUrl.searchParams.delete("github_state");
    window.history.replaceState({}, "", cleanUrl.toString());
    sessionStorage.removeItem("github_oauth_state");

    // In a production setup, exchange `code` → `access_token` via your backend.
    // For now we surface the code for manual PAT linking:
    console.info("[GitHubOAuth] OAuth code received. Exchange via backend:", code);
  }, []);

  // ── 3. connect() — Opens GitHub's OAuth authorize page ────────────────────
  const connect = useCallback(() => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error("[GitHubOAuth] GITHUB_CLIENT_ID not set in .env");
      return;
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem("github_oauth_state", state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      scope: "repo read:user",
      state,
    });

    window.location.href = `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
  }, []);

  // ── 4. connectWithPAT() — Direct PAT connection (MVP / dev use) ───────────
  const connectWithPAT = useCallback(async (pat: string) => {
    if (!pat.trim()) return;
    setIsLoading(true);
    try {
      const octokit = new Octokit({ auth: pat });
      const { data } = await octokit.rest.users.getAuthenticated();
      const ghUser: GitHubUser = {
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name,
      };
      localStorage.setItem(STORAGE_KEY_TOKEN, pat);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(ghUser));
      setToken(pat);
      setUser(ghUser);
    } catch (err) {
      throw new Error("Invalid GitHub token. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── 5. disconnect() ────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setToken(null);
    setUser(null);
  }, []);

  // ── 6. getOctokit() — Returns an authenticated Octokit for callers ─────────
  const getOctokit = useCallback(() => {
    // Authenticated if token is available, otherwise anonymous (public repos only, 60 req/hr)
    return token ? new Octokit({ auth: token }) : new Octokit();
  }, [token]);

  return {
    isConnected,
    isLoading,
    user,
    token,
    connect,
    connectWithPAT,
    disconnect,
    getOctokit,
  };
}
