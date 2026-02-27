'use client';

import { useState } from 'react';
import { ClipboardPaste, ChevronDown, ChevronUp, Sparkles, Trash2, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { Cookie, Preset } from '@/app/types';

interface BulkCookieParserProps {
  onParsed: (cookies: Cookie[]) => void;
  activePreset: Preset | null;
}

interface ParsedCookie {
  name: string;
  value: string;
  selected: boolean;
  matchesPreset: boolean;
}

/**
 * Parse raw cookie string from browser DevTools Network tab
 * Format: "name1=value1; name2=value2; name3=value3"
 */
function parseRawCookieString(raw: string): { name: string; value: string }[] {
  if (!raw.trim()) return [];

  // Remove "Cookie: " prefix if user copied the full header line
  let cleaned = raw.trim();
  if (cleaned.toLowerCase().startsWith('cookie:')) {
    cleaned = cleaned.substring(7).trim();
  }

  // Split by "; " (some cookies may have ";" without space too)
  const pairs = cleaned.split(/;\s*/);
  const result: { name: string; value: string }[] = [];

  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;

    // Split on FIRST "=" only, since values can contain "="
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const name = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (name) {
      result.push({ name, value });
    }
  }

  return result;
}

export default function BulkCookieParser({ onParsed, activePreset }: BulkCookieParserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [parsedCookies, setParsedCookies] = useState<ParsedCookie[]>([]);
  const [isParsed, setIsParsed] = useState(false);
  const [filterPresetOnly, setFilterPresetOnly] = useState(false);

  const handleParse = () => {
    const parsed = parseRawCookieString(rawInput);
    if (parsed.length === 0) return;

    const presetCookieNames = activePreset?.cookies.map(c => c.name.toLowerCase()) || [];

    const withSelection = parsed.map(c => ({
      ...c,
      selected: true,
      matchesPreset: presetCookieNames.length > 0
        ? presetCookieNames.includes(c.name.toLowerCase())
        : false,
    }));

    setParsedCookies(withSelection);
    setIsParsed(true);
  };

  const handleApply = () => {
    let toApply = parsedCookies.filter(c => c.selected);

    if (filterPresetOnly && activePreset) {
      toApply = toApply.filter(c => c.matchesPreset);
    }

    const cookies: Cookie[] = toApply.map(c => ({
      name: c.name,
      value: c.value,
    }));

    if (cookies.length > 0) {
      onParsed(cookies);
      // Reset
      setRawInput('');
      setParsedCookies([]);
      setIsParsed(false);
      setIsOpen(false);
    }
  };

  const toggleCookie = (index: number) => {
    const updated = [...parsedCookies];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setParsedCookies(updated);
  };

  const selectAll = () => {
    setParsedCookies(parsedCookies.map(c => ({ ...c, selected: true })));
  };

  const deselectAll = () => {
    setParsedCookies(parsedCookies.map(c => ({ ...c, selected: false })));
  };

  const selectPresetOnly = () => {
    setParsedCookies(parsedCookies.map(c => ({ ...c, selected: c.matchesPreset })));
  };

  const handleReset = () => {
    setRawInput('');
    setParsedCookies([]);
    setIsParsed(false);
    setFilterPresetOnly(false);
  };

  const selectedCount = parsedCookies.filter(c => c.selected).length;
  const presetMatchCount = parsedCookies.filter(c => c.matchesPreset).length;
  const displayedCookies = filterPresetOnly
    ? parsedCookies.filter(c => c.matchesPreset)
    : parsedCookies;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-lg hover:from-amber-900/40 hover:to-orange-900/40 transition-all group"
      >
        <div className="flex items-center gap-2">
          <ClipboardPaste className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">Bulk Cookie Import</span>
          <span className="text-xs text-amber-500/70">Paste dari Network Tab</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 bg-dark-900 border border-amber-700/30 rounded-lg p-4 animate-[fadeIn_0.2s_ease-out]">
          {/* Step 1: Paste raw cookie string */}
          {!isParsed && (
            <>
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Paste cookie string dari DevTools Network Tab
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Buka DevTools → Network → klik request → Headers → Request Headers → salin baris <code className="text-amber-400/80 bg-amber-900/20 px-1 rounded">Cookie:</code>
                </p>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste disini... contoh: connect.sid=abc123; _ga=GA1.2.xxx; session=xyz..."
                  className="w-full bg-dark-800 border border-slate-600 rounded-lg p-3 text-xs text-white placeholder-slate-600 h-28 resize-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none font-mono"
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {rawInput.trim() ? `~${rawInput.split(/;\s*/).filter(s => s.includes('=')).length} cookies terdeteksi` : 'Belum ada input'}
                </span>
                <button
                  onClick={handleParse}
                  disabled={!rawInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Parse Cookies
                </button>
              </div>
            </>
          )}

          {/* Step 2: Review parsed cookies */}
          {isParsed && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">
                    {parsedCookies.length} cookies berhasil di-parse
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Info banner if preset is active */}
              {activePreset && presetMatchCount > 0 && (
                <div className="mb-3 flex items-start gap-2 p-2.5 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-300">
                    <strong>{presetMatchCount}</strong> dari {parsedCookies.length} cookies cocok dengan preset <strong>{activePreset.name}</strong>.
                    <button
                      onClick={selectPresetOnly}
                      className="ml-1 text-blue-400 hover:text-blue-300 underline"
                    >
                      Pilih yang cocok saja
                    </button>
                  </div>
                </div>
              )}

              {/* Selection controls */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <button
                  onClick={selectAll}
                  className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                >
                  Hapus Semua
                </button>
                {activePreset && presetMatchCount > 0 && (
                  <button
                    onClick={() => setFilterPresetOnly(!filterPresetOnly)}
                    className={`text-xs px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      filterPresetOnly
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    Hanya Preset
                  </button>
                )}
                <span className="text-xs text-slate-500 ml-auto">
                  {selectedCount} dipilih
                </span>
              </div>

              {/* Cookie list */}
              <div className="max-h-60 overflow-y-auto space-y-1 mb-3 scrollbar-thin scrollbar-thumb-slate-700">
                {displayedCookies.map((cookie, idx) => {
                  // Find original index for toggling
                  const originalIndex = parsedCookies.indexOf(cookie);
                  return (
                    <label
                      key={originalIndex}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                        cookie.selected
                          ? cookie.matchesPreset
                            ? 'bg-blue-900/20 border border-blue-700/30'
                            : 'bg-slate-700/30 border border-slate-600/30'
                          : 'bg-transparent border border-transparent hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={cookie.selected}
                        onChange={() => toggleCookie(originalIndex)}
                        className="w-3.5 h-3.5 rounded border-slate-600 bg-dark-800 text-amber-500 focus:ring-amber-500 flex-shrink-0"
                      />
                      <span className={`text-xs font-mono truncate ${
                        cookie.matchesPreset ? 'text-blue-300' : 'text-amber-300'
                      }`}>
                        {cookie.name}
                      </span>
                      <span className="text-[10px] text-slate-600 truncate flex-1 max-w-[200px] font-mono">
                        = {cookie.value.length > 40 ? cookie.value.substring(0, 40) + '...' : cookie.value}
                      </span>
                      {cookie.matchesPreset && (
                        <span className="text-[10px] bg-blue-800/50 text-blue-300 px-1.5 py-0.5 rounded flex-shrink-0">
                          preset
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={selectedCount === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <ClipboardPaste className="w-4 h-4" />
                Terapkan {selectedCount} Cookie{selectedCount !== 1 ? 's' : ''}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
