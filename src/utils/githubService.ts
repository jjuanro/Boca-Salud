import { GitHubUser } from '../types/health';

const GITHUB_STORAGE_KEY = 'bocasalud_github_user_v1';

export function getStoredGitHubUser(): GitHubUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GITHUB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredGitHubUser(user: GitHubUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(GITHUB_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchGitHubAuthUrl(): Promise<{
  url: string;
  configured: boolean;
  clientId: string | null;
  redirectUri: string;
}> {
  try {
    const res = await fetch('/api/auth/github/url');
    if (!res.ok) throw new Error('Error al obtener URL de autenticación');
    return await res.json();
  } catch (err) {
    console.error('Error fetching GitHub auth URL:', err);
    return {
      url: '',
      configured: false,
      clientId: null,
      redirectUri: `${window.location.origin}/auth/callback`,
    };
  }
}

export async function connectGitHubWithUsername(username: string): Promise<GitHubUser> {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) {
    throw new Error('Por favor ingresa un nombre de usuario de GitHub');
  }

  // 1. Try local/backend API endpoint if present
  try {
    const res = await fetch('/api/auth/github/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUsername }),
    });

    if (res.ok) {
      const { user } = await res.json();
      if (user) {
        saveStoredGitHubUser(user);
        return user;
      }
    }
  } catch (err) {
    console.warn('Backend proxy lookup failed, falling back to direct GitHub API:', err);
  }

  // 2. Direct client-side GitHub API fallback (works natively on Netlify, Vercel, static hosting)
  try {
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        throw new Error(`El usuario de GitHub "@${cleanUsername}" no existe.`);
      }
      throw new Error(`Error al consultar GitHub (${ghRes.status}). Verifica el nombre.`);
    }

    const u = await ghRes.json();
    const user: GitHubUser = {
      id: u.id,
      login: u.login,
      name: u.name || u.login,
      avatar_url: u.avatar_url,
      bio: u.bio || 'Atleta & Miembro Boca Salud',
      html_url: u.html_url,
      public_repos: u.public_repos ?? 0,
      followers: u.followers ?? 0,
      connectedAt: new Date().toISOString(),
    };

    saveStoredGitHubUser(user);
    return user;
  } catch (error: any) {
    if (error.message && error.message.includes('GitHub')) {
      throw error;
    }
    throw new Error('No se pudo conectar con GitHub. Revisa tu conexión a internet.');
  }
}

export function openGitHubOAuthPopup(
  authUrl: string,
  onSuccess: (user: GitHubUser) => void,
  onError?: (err: string) => void
): () => void {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'github_oauth_popup',
    `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0`
  );

  if (!popup) {
    onError?.('La ventana emergente fue bloqueada por el navegador. Permite ventanas emergentes.');
  }

  const messageHandler = (event: MessageEvent) => {
    // Validate origin matches current domain or run.app
    const origin = event.origin || '';
    if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
      return;
    }

    if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
      const user: GitHubUser = event.data.user;
      saveStoredGitHubUser(user);
      onSuccess(user);
      window.removeEventListener('message', messageHandler);
    }
  };

  window.addEventListener('message', messageHandler);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}
