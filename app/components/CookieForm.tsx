'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Cookie } from '@/app/types';

interface CookieFormProps {
  cookies: Cookie[];
  onChange: (cookies: Cookie[]) => void;
  showAdvanced?: boolean;
}

export default function CookieForm({ cookies, onChange, showAdvanced = false }: CookieFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const updateCookie = (index: number, field: keyof Cookie, value: string | boolean | undefined) => {
    const updated = [...cookies];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addCookie = () => {
    onChange([...cookies, { name: '', value: '' }]);
  };

  const removeCookie = (index: number) => {
    const updated = cookies.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-slate-300">Cookie Values</label>
        <button
          onClick={addCookie}
          className="text-xs text-brand-500 hover:text-brand-400 font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Field
        </button>
      </div>
      <div className="space-y-3">
        {cookies.map((cookie, index) => (
          <div key={index} className="bg-dark-900 border border-slate-700 rounded-lg p-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <div className={showAdvanced ? "grid grid-cols-2 gap-2" : ""}>
                  <input
                    type="text"
                    value={cookie.name}
                    onChange={(e) => updateCookie(index, 'name', e.target.value)}
                    placeholder="Cookie Name"
                    className="cookie-name w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-xs text-brand-300 placeholder-slate-600 focus:border-brand-500 outline-none"
                    suppressHydrationWarning
                  />
                  {showAdvanced && (
                    <input
                      type="text"
                      value={cookie.prioritas || ''}
                      onChange={(e) => updateCookie(index, 'prioritas', e.target.value || undefined)}
                      placeholder="Prioritas (optional)"
                      className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-xs text-white placeholder-slate-600 focus:border-brand-500 outline-none"
                      suppressHydrationWarning
                    />
                  )}
                </div>
                <textarea
                  value={cookie.value}
                  onChange={(e) => updateCookie(index, 'value', e.target.value)}
                  placeholder="Paste Cookie Value here..."
                  className="cookie-value w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-xs text-white placeholder-slate-600 h-16 resize-none focus:border-brand-500 outline-none"
                  suppressHydrationWarning
                />
                
                {/* Field Advanced - langsung tampil jika showAdvanced=true, atau bisa di-expand jika showAdvanced=false */}
                {(showAdvanced || expandedIndex === index) && (
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <input
                      type="text"
                      value={cookie.domain || ''}
                      onChange={(e) => updateCookie(index, 'domain', e.target.value || undefined)}
                      placeholder="Domain (e.g. .example.com)"
                      className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-xs text-white placeholder-slate-600 focus:border-brand-500 outline-none"
                      suppressHydrationWarning
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cookie.httpOnly || false}
                          onChange={(e) => updateCookie(index, 'httpOnly', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-dark-800 text-brand-600 focus:ring-brand-500"
                          suppressHydrationWarning
                        />
                        HttpOnly
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cookie.secure || false}
                          onChange={(e) => updateCookie(index, 'secure', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-dark-800 text-brand-600 focus:ring-brand-500"
                          suppressHydrationWarning
                        />
                        Secure
                      </label>
                      <select
                        value={cookie.sameSite || ''}
                        onChange={(e) => updateCookie(index, 'sameSite', e.target.value || undefined)}
                        className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-xs text-white focus:border-brand-500 outline-none"
                        suppressHydrationWarning
                      >
                        <option value="">SameSite (optional)</option>
                        <option value="Strict">Strict</option>
                        <option value="Lax">Lax</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Tombol expand/collapse - hanya muncul jika showAdvanced=false */}
                {!showAdvanced && (
                  <button
                    onClick={() => toggleExpand(index)}
                    className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1 mt-1"
                  >
                    {expandedIndex === index ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Hide Advanced
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show Advanced
                      </>
                    )}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeCookie(index)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                title="Remove field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

