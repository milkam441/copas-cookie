'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Film, Camera, PlayCircle, Music2, RotateCcw, Save, List, Tv, Settings, User, Brain } from 'lucide-react';
import { Entry, Cookie } from '@/app/types';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { useTimer } from '@/app/hooks/useTimer';
import { addEntry, deleteEntry } from '@/app/utils/storage';
import { getPreset, PRESETS } from '@/app/utils/presets';
import { useToast } from './ToastContext';
import Statistics from './Statistics';
import EntryCard from './EntryCard';
import CookieForm from './CookieForm';

export default function AdminTab() {
  const { entries, refreshEntries } = useLocalStorage();
  const { getTimer, getProgress } = useTimer(entries, refreshEntries);
  const { showToast } = useToast();

  const [websiteName, setWebsiteName] = useState('');
  const [cookies, setCookies] = useState<Cookie[]>([{ name: '', value: '' }]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (type: string) => {
    const preset = getPreset(type);
    if (!preset) return;

    setWebsiteName(preset.name);
    setActivePreset(type);

    if (preset.type === 'simple') {
      // Netflix: hanya cookies sederhana (name, value)
      const presetCookies: Cookie[] = preset.cookies.map((name) => ({ name, value: '' }));
      setCookies(presetCookies);
      setUsername('');
      setPassword('');
    } else if (preset.type === 'full') {
      // BStation: cookies dengan field lengkap
      const presetCookies: Cookie[] = preset.cookies.map((cookie) => ({
        name: cookie.name,
        value: '',
        domain: cookie.domain,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        prioritas: cookie.prioritas,
      }));
      setCookies(presetCookies);
      setUsername('');
      setPassword('');
    } else if (preset.type === 'credentials') {
      // HBO Go: hanya username dan password
      setUsername(preset.username || '');
      setPassword(preset.password || '');
      setCookies([]);
    }

    showToast('Preset Loaded', `${preset.name} template applied.`, 'info');
  };

  const resetForm = () => {
    setWebsiteName('');
    setCookies([{ name: '', value: '' }]);
    setUsername('');
    setPassword('');
    setActivePreset(null);
  };

  const handleSave = () => {
    const trimmedWebsite = websiteName.trim();
    if (!trimmedWebsite) {
      showToast('Error', 'Website Name is required', 'error');
      return;
    }

    const preset = activePreset ? getPreset(activePreset) : null;
    const validCookies = cookies.filter((c) => c.name.trim() && c.value.trim());
    const hasUsername = username.trim();
    const hasPassword = password.trim();

    // Validasi sesuai jenis preset
    if (preset?.type === 'credentials') {
      // HBO Go: harus ada username atau password
      if (!hasUsername && !hasPassword) {
        showToast('Error', 'Username or Password is required', 'error');
        return;
      }
    } else {
      // Netflix dan BStation: harus ada cookies
      if (validCookies.length === 0) {
        showToast('Error', 'At least one valid cookie (name & value) is required', 'error');
        return;
      }
    }

    addEntry(
      trimmedWebsite,
      validCookies,
      hasUsername ? username.trim() : undefined,
      hasPassword ? password.trim() : undefined
    );
    resetForm();
    refreshEntries();
    showToast('Success', 'Entry added successfully!', 'success');
  };

  const handleDelete = (id: number) => {
    deleteEntry(id);
    refreshEntries();
    showToast('Deleted', 'Entry removed.', 'info');
  };

  const totalCookies = entries.reduce((sum, entry) => sum + entry.cookies.length, 0);

  return (
    <div className="fade-in">
      <Statistics activeEntries={entries.length} totalCookies={totalCookies} />

      {/* Create New Entry Form */}
      <div className="bg-dark-800 border border-slate-700 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-green-400" />
            Add New Entry
          </h2>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Auto-delete in 1h</span>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('netflix')}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-800 text-red-400 rounded hover:bg-red-900/50 transition-colors text-sm"
            >
              <Film className="w-3 h-3" />
              Netflix
            </button>

            <button
              onClick={() => applyPreset('hbogo')}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 border border-purple-800 text-purple-400 rounded hover:bg-purple-900/50 transition-colors text-sm"
            >
              <User className="w-3 h-3" />
              HBO Go
            </button>

            <button
              onClick={() => applyPreset('bstation')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-800 text-blue-400 rounded hover:bg-blue-900/50 transition-colors text-sm"
            >
              <Tv className="w-3 h-3" />
              BStation
            </button>

            <button
              onClick={() => applyPreset('chatgpt')}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-800 text-green-400 rounded hover:bg-green-900/50 transition-colors text-sm"
            >
              <Brain className="w-3 h-3" />
              ChatGPT
            </button>
            
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Website Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">Website Name</label>
          <input
            type="text"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            placeholder="e.g. Netflix Premium"
            className="w-full bg-dark-900 border border-slate-600 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
            suppressHydrationWarning
          />
        </div>

        {/* Username & Password - hanya untuk preset credentials (HBO Go) */}
        {activePreset && getPreset(activePreset)?.type === 'credentials' && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-dark-900 border border-slate-600 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-dark-900 border border-slate-600 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                suppressHydrationWarning
              />
            </div>
          </div>
        )}

        {/* Dynamic Cookie Fields - tidak untuk preset credentials */}
        {(!activePreset || getPreset(activePreset)?.type !== 'credentials') && (
          <CookieForm 
            cookies={cookies} 
            onChange={setCookies} 
            showAdvanced={activePreset ? (getPreset(activePreset)?.type === 'full' ? true : false) : false}
          />
        )}

        {/* Action Button */}
        <button
          onClick={handleSave}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Publish Entry
        </button>
      </div>

      {/* Admin Entry List */}
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <List className="w-5 h-5 text-slate-400" />
        Active Database
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {entries.length === 0 ? (
          <div className="text-center p-8 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No active entries found. Create one above.
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              timer={getTimer(entry.id)}
              progress={getProgress(entry.id)}
              onDelete={handleDelete}
              variant="admin"
            />
          ))
        )}
      </div>
    </div>
  );
}

