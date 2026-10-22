import React, { useState, useEffect } from 'react';
import { 
  X, Check, ExternalLink, ShieldCheck, RefreshCw, 
  LogOut, Sparkles, Smartphone, Code2, Copy, AlertCircle, UserCheck
} from 'lucide-react';
import { GitHubUser } from '../types/health';
import { 
  fetchGitHubAuthUrl, 
  openGitHubOAuthPopup, 
  connectGitHubWithUsername, 
  saveStoredGitHubUser 
} from '../utils/githubService';
import { sounds } from '../utils/audio';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GitHubUser | null;
  onUserChange: (user: GitHubUser | null) => void;
}

export const GitHubAuthModal: React.FC<GitHubAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthConfig, setOauthConfig] = useState<{
    url: string;
    configured: boolean;
    clientId: string | null;
    redirectUri: string;
  } | null>(null);
  const [manualUsername, setManualUsername] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOAuthConfig();
    }
  }, [isOpen]);

  const loadOAuthConfig = async () => {
    try {
      const cfg = await fetchGitHubAuthUrl();
      setOauthConfig(cfg);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleConnectOAuth = () => {
    sounds.playTap();
    setErrorMsg(null);

    if (oauthConfig?.configured && oauthConfig.url) {
      setLoading(true);
      const cleanup = openGitHubOAuthPopup(
        oauthConfig.url,
        (user) => {
          setLoading(false);
          onUserChange(user);
        },
        (err) => {
          setLoading(false);
          setErrorMsg(err);
        }
      );
      // Failsafe timeout
      setTimeout(() => setLoading(false), 30000);
    } else {
      // If client ID is not configured yet, invite user to enter username or review instructions
      setShowDocs(true);
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUsername.trim()) return;
    sounds.playTap();
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await connectGitHubWithUsername(manualUsername.trim());
      onUserChange(user);
      setManualUsername('');
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo conectar con GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    sounds.playTap();
    saveStoredGitHubUser(null);
    onUserChange(null);
  };

  const handleCopyCallbackUrl = () => {
    sounds.playTap();
    const url = oauthConfig?.redirectUri || `${window.location.origin}/auth/callback`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const callbackUrl = oauthConfig?.redirectUri || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0F131D] border border-[#0A84FF]/40 shadow-2xl p-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#0A84FF]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161B22] to-[#0D1117] border border-[#0A84FF]/40 flex items-center justify-center text-white shadow-lg shadow-[#0A84FF]/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Acceso con GitHub</span>
                <span className="text-[9px] font-bold text-[#D4AF37] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 uppercase">
                  Boca Salud
                </span>
              </h3>
              <p className="text-xs text-[#38BDF8]">
                Sincroniza tu identidad de desarrollador en tu iPhone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-slate-300 flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Section */}
        <div className="space-y-4 pt-4">
          {currentUser ? (
            /* Connected View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0A0D14] border border-[#0A84FF]/40 shadow-xl flex items-start gap-3.5">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.login}
                  className="w-14 h-14 rounded-2xl border-2 border-[#D4AF37] object-cover shadow-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Conectado
                    </span>
                    <span className="text-[10px] text-slate-400">· GitHub</span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate mt-0.5">
                    {currentUser.name || currentUser.login}
                  </h4>
                  <p className="text-[11px] text-[#38BDF8] truncate">
                    @{currentUser.login}
                  </p>
                  {currentUser.bio && (
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {currentUser.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* GitHub Stats Row */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#0A0D14] border border-neutral-800">
                  <span className="text-slate-400 text-[10px] block">Repositorios Públicos</span>
                  <strong className="text-white text-sm font-mono font-bold">
                    {currentUser.public_repos ?? 0}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0D14] border border-neutral-800">
                  <span className="text-slate-400 text-[10px] block">Seguidores en GitHub</span>
                  <strong className="text-white text-sm font-mono font-bold">
                    {currentUser.followers ?? 0}
                  </strong>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <a
                  href={currentUser.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver en GitHub</span>
                </a>

                <button
                  onClick={handleDisconnect}
                  className="py-2.5 px-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>
            </div>
          ) : (
            /* Connect Options View */
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Inicia sesión con tu cuenta de GitHub para sincronizar tus metas diarias, respaldar tu progreso saludable de Boca Salud y llevarlo siempre en tu iPhone.
              </p>

              {/* Option A: OAuth Popup Button */}
              <button
                onClick={handleConnectOAuth}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#24292E] via-[#1B1F23] to-[#0D1117] border border-[#0A84FF]/40 hover:border-[#D4AF37] text-white font-bold text-xs shadow-xl shadow-[#0A84FF]/15 flex items-center justify-center gap-2.5 active:scale-95 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>
                  {loading ? 'Abriendo autenticación...' : 'Iniciar Sesión con GitHub (OAuth)'}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 my-1">
                <div className="flex-1 h-px bg-neutral-800" />
                <span>O conecta con tu usuario de GitHub</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              {/* Option B: Direct Username Lookup Form */}
              <form onSubmit={handleManualConnect} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="tu-usuario-github"
                      value={manualUsername}
                      onChange={(e) => setManualUsername(e.target.value)}
                      className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-[#0A0D14] border border-neutral-800 focus:border-[#0A84FF] text-white text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !manualUsername.trim()}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0284C7] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#0A84FF]/25 active:scale-95 transition"
                  >
                    Conectar
                  </button>
                </div>
              </form>

              {/* Setup Info Accordion */}
              <div className="pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setShowDocs(!showDocs)}
                  className="w-full flex items-center justify-between text-xs text-[#38BDF8] hover:text-[#D4AF37] transition font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Configuración de OAuth para Producción</span>
                  </span>
                  <span>{showDocs ? 'Ocultar' : 'Ver Detalles'}</span>
                </button>

                {showDocs && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-[#0A0D14] border border-neutral-800 space-y-2.5 text-xs text-slate-300 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-400">
                      Para usar el flujo OAuth oficial de GitHub en producción, crea una <strong>OAuth App</strong> en <a href="https://github.com/settings/developers" target="_blank" rel="noreferrer" className="text-[#38BDF8] underline">GitHub Developer Settings</a> con esta Callback URL:
                    </p>

                    <div className="p-2 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-200 truncate pr-2">
                        {callbackUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCallbackUrl}
                        className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[#38BDF8] hover:text-white transition flex-shrink-0"
                        title="Copiar URL"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Luego añade <code className="text-[#D4AF37]">GITHUB_CLIENT_ID</code> y <code className="text-[#D4AF37]">GITHUB_CLIENT_SECRET</code> en los Secretos de AI Studio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
