'use client';

import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Cookie } from '@/app/types';
import { useToast } from './ToastContext';

interface CookieItemProps {
  cookie: Cookie;
  onCopy?: (value: string) => void;
  variant?: 'admin' | 'user';
}

export default function CookieItem({ cookie, onCopy, variant = 'user' }: CookieItemProps) {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if cookie has full properties (full type)
  const isFullType = cookie.domain !== undefined || 
                     cookie.httpOnly !== undefined || 
                     cookie.secure !== undefined || 
                     cookie.sameSite !== undefined || 
                     cookie.prioritas !== undefined;

  const handleCopyValue = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('Copied!', `${label} copied to clipboard.`, 'success');
    } catch (err) {
      showToast('Error', 'Failed to copy to clipboard', 'error');
    }
  };

  const handleCopyName = async () => {
    // Copy cookie name
    const textToCopy = cookie.name;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Copied!', 'Cookie name copied to clipboard.', 'success');
        return;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          showToast('Copied!', 'Cookie name copied to clipboard.', 'success');
        } else {
          throw new Error('execCommand failed');
        }
      }
    } catch (err) {
      showToast('Error', 'Failed to copy to clipboard. Please try manually selecting the text.', 'error');
    }
  };

  const handleCopy = async () => {
    // Always copy just the value for main copy button
    const textToCopy = cookie.value;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        if (onCopy) {
          onCopy(textToCopy);
        } else {
          showToast('Copied!', 'Cookie value copied to clipboard.', 'success');
        }
        return;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          if (onCopy) {
            onCopy(textToCopy);
          } else {
            showToast('Copied!', 'Cookie value copied to clipboard.', 'success');
          }
        } else {
          throw new Error('execCommand failed');
        }
      }
    } catch (err) {
      showToast('Error', 'Failed to copy to clipboard. Please try manually selecting the text.', 'error');
    }
  };

  if (variant === 'admin') {
    return (
      <div className="bg-dark-900 p-2 rounded border border-slate-700 flex justify-between items-center group/cookie">
        <div className="overflow-hidden mr-2 flex-1">
          <div className="text-xs text-brand-400 font-semibold truncate">{cookie.name}</div>
          <div className="text-[10px] text-slate-500 truncate font-mono">value hidden</div>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 rounded border border-slate-700 overflow-hidden">
      {/* Main row */}
      <div className="p-2.5 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-300 truncate">{cookie.name}</span>
          <button
            onClick={handleCopyName}
            className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
            title="Copy cookie name"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isFullType && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1"
              title="Show details"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-3 py-1.5 rounded transition-all flex items-center gap-1 font-semibold"
            title="Copy cookie value"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
      </div>

      {/* Details dropdown for full type */}
      {isFullType && isExpanded && (
        <div className="border-t border-slate-700 p-2.5 space-y-2 bg-dark-800/50">
          {/* Value */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Value:</span>
            <div className="flex items-center gap-2 flex-1 max-w-[70%]">
              <span className="text-xs text-slate-300 truncate font-mono">{cookie.value}</span>
              <button
                onClick={() => handleCopyValue(cookie.value, 'Value')}
                className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Domain */}
          {cookie.domain !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Domain:</span>
              <div className="flex items-center gap-2 flex-1 max-w-[70%]">
                <span className="text-xs text-slate-300 truncate">{cookie.domain || '(empty)'}</span>
                <button
                  onClick={() => handleCopyValue(cookie.domain || '', 'Domain')}
                  className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* HttpOnly */}
          {cookie.httpOnly !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">HttpOnly:</span>
              <div className="flex items-center gap-2 flex-1 max-w-[70%]">
                <span className="text-xs text-slate-300">{cookie.httpOnly ? 'true' : 'false'}</span>
                <button
                  onClick={() => handleCopyValue(cookie.httpOnly ? 'true' : 'false', 'HttpOnly')}
                  className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Secure */}
          {cookie.secure !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Secure:</span>
              <div className="flex items-center gap-2 flex-1 max-w-[70%]">
                <span className="text-xs text-slate-300">{cookie.secure ? 'true' : 'false'}</span>
                <button
                  onClick={() => handleCopyValue(cookie.secure ? 'true' : 'false', 'Secure')}
                  className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* SameSite */}
          {cookie.sameSite !== undefined && cookie.sameSite && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">SameSite:</span>
              <div className="flex items-center gap-2 flex-1 max-w-[70%]">
                <span className="text-xs text-slate-300">{cookie.sameSite}</span>
                <button
                  onClick={() => handleCopyValue(cookie.sameSite!, 'SameSite')}
                  className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Prioritas */}
          {cookie.prioritas !== undefined && cookie.prioritas && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Prioritas:</span>
              <div className="flex items-center gap-2 flex-1 max-w-[70%]">
                <span className="text-xs text-slate-300">{cookie.prioritas}</span>
                <button
                  onClick={() => handleCopyValue(cookie.prioritas!, 'Prioritas')}
                  className="text-xs bg-brand-600/10 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 border border-brand-600/30 px-2 py-1 rounded transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

