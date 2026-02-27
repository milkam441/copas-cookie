'use client';

import { Trash, Clock, Timer, User, Lock, Copy, Code } from 'lucide-react';
import { Entry } from '@/app/types';
import CookieItem from './CookieItem';
import { FormattedTime } from '@/app/utils/formatTime';
import { useToast } from './ToastContext';

interface EntryCardProps {
  entry: Entry;
  timer: FormattedTime;
  progress: number;
  onDelete?: (id: number) => void;
  variant?: 'admin' | 'user';
}

export default function EntryCard({ entry, timer, progress, onDelete, variant = 'user' }: EntryCardProps) {
  const timerColor = timer.isUrgent ? 'text-red-400' : variant === 'admin' ? 'text-yellow-400' : 'text-green-400';
  const { showToast } = useToast();

  const buildCookieSnippet = () => {
    const snippetCookies = entry.cookies.map((cookie) => ({
      name: cookie.name || '',
      value: cookie.value || '',
      domain: cookie.domain || '',
      path: '/',
      secure: Boolean(cookie.secure),
      sameSite: cookie.secure ? 'none' : (cookie.sameSite ? cookie.sameSite.toLowerCase() : ''),
    }));

    return `// Cookie Injector Snippet
const cookies = ${JSON.stringify(snippetCookies, null, 2)};

cookies.forEach(c => {
  const securePart = c.secure ? '; secure' : '';
  const sameSitePart = c.sameSite ? \`; samesite=${'${c.sameSite}'}\` : '';
  document.cookie = \`${'${c.name}'}=${'${c.value}'}; domain=${'${c.domain}'}; path=${'${c.path}'}${'${securePart}'}${'${sameSitePart}'}\`;
});

console.log("✅ Cookie injected! Refreshing...");
location.reload();`;
  };

  const handleCopyCredentials = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('Copied!', `${label} copied to clipboard.`, 'success');
    } catch {
      showToast('Error', 'Failed to copy to clipboard', 'error');
    }
  };

  const handleCopySnippet = async () => {
    const snippet = buildCookieSnippet();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = snippet;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('Copied!', 'Cookie snippet copied. Paste it into console and run.', 'success');
    } catch {
      showToast('Error', 'Failed to copy snippet to clipboard', 'error');
    }
  };

  if (variant === 'admin') {
    return (
      <div className="bg-dark-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm relative group">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-700 absolute top-0 left-0">
          <div
            className={`h-full transition-all duration-1000 ${progress < 10 ? 'bg-red-500' : 'bg-brand-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 pt-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-lg text-white">{entry.website}</h4>
              <span className={`text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono ${timerColor}`}>
                <Clock className="w-3 h-3" />
                <span>{timer.text}</span> remaining
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySnippet}
                className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2.5 py-1.5 rounded transition-all flex items-center gap-1 font-semibold"
                title="Copy console snippet"
              >
                <Code className="w-3 h-3" />
                Snippet
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Username & Password */}
          {(entry.username || entry.password) && (
            <div className="mb-3 space-y-2">
              {entry.username && (
                <div className="bg-dark-900 p-2 rounded border border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <User className="w-3 h-3 text-brand-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400">Username:</span>
                    <span className="text-xs text-white truncate">{entry.username}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCredentials(entry.username!, 'Username')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1 flex-shrink-0 ml-2"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              )}
              {entry.password && (
                <div className="bg-dark-900 p-2 rounded border border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Lock className="w-3 h-3 text-brand-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400">Password:</span>
                    <span className="text-xs text-white truncate">••••••••</span>
                  </div>
                  <button
                    onClick={() => handleCopyCredentials(entry.password!, 'Password')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1 flex-shrink-0 ml-2"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {entry.cookies.map((cookie, idx) => (
              <CookieItem key={idx} cookie={cookie} variant="admin" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 border border-slate-700 rounded-xl p-4 shadow-sm hover:border-brand-500/50 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-lg text-white">{entry.website}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySnippet}
            className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-3 py-1.5 rounded transition-all flex items-center gap-1 font-semibold"
            title="Copy console snippet"
          >
            <Code className="w-3 h-3" />
            Copy Snippet
          </button>
          <span
            className={`text-xs bg-dark-900 px-2 py-1 rounded border border-slate-700 font-mono ${timerColor} flex items-center gap-1`}
          >
            <Timer className="w-3 h-3" />
            <span>{timer.text}</span>
          </span>
        </div>
      </div>

      {/* Username & Password */}
      {(entry.username || entry.password) && (
        <div className="mb-3 space-y-2">
          {entry.username && (
            <div className="bg-dark-900 p-2.5 rounded border border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User className="w-3 h-3 text-brand-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">Username:</span>
                <span className="text-xs text-white truncate">{entry.username}</span>
              </div>
              <button
                onClick={() => handleCopyCredentials(entry.username!, 'Username')}
                className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-3 py-1.5 rounded transition-all flex items-center gap-1 font-semibold flex-shrink-0 ml-2"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          )}
          {entry.password && (
            <div className="bg-dark-900 p-2.5 rounded border border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Lock className="w-3 h-3 text-brand-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">Password:</span>
                <span className="text-xs text-white truncate">••••••••</span>
              </div>
              <button
                onClick={() => handleCopyCredentials(entry.password!, 'Password')}
                className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-3 py-1.5 rounded transition-all flex items-center gap-1 font-semibold flex-shrink-0 ml-2"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {entry.cookies.map((cookie, idx) => (
          <CookieItem key={idx} cookie={cookie} variant="user" />
        ))}
      </div>
    </div>
  );
}

