'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Film, Camera, PlayCircle, Music2, RotateCcw, Save, List, Tv, Settings, User, Brain, Code } from 'lucide-react';
import { Entry, Cookie, Preset } from '@/app/types';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { useTimer } from '@/app/hooks/useTimer';
import { addEntry, deleteEntry } from '@/app/utils/storage';
import { fetchPresets, getPresetsByGroup, applyPreset as applyPresetUtil } from '@/app/utils/presetApi';
import { useToast } from './ToastContext';
import Statistics from './Statistics';
import EntryCard from './EntryCard';
import CookieForm from './CookieForm';
import PresetManager from './PresetManager';

export default function AdminTab() {
  const { entries, refreshEntries } = useLocalStorage();
  const { getTimer, getProgress } = useTimer(entries, refreshEntries);
  const { showToast } = useToast();

  const [websiteName, setWebsiteName] = useState('');
  const [cookies, setCookies] = useState<Cookie[]>([{ name: '', value: '' }]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const loadPresets = useCallback(async () => {
    try {
      const data = await fetchPresets();
      setPresets(data);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const applyPreset = (preset: Preset) => {
    const result = applyPresetUtil(preset);
    setWebsiteName(result.websiteName);
    setCookies(result.cookies.length > 0 ? result.cookies : [{ name: '', value: '' }]);
    setShowAdvanced(result.showAdvanced);
    setActivePreset(preset);

    if (preset.type === 'credentials') {
      setUsername('');
      setPassword('');
    } else {
      setUsername('');
      setPassword('');
    }

    showToast('Preset Loaded', `${preset.name} template applied.`, 'info');
  };

  const resetForm = () => {
    setWebsiteName('');
    setCookies([{ name: '', value: '' }]);
    setUsername('');
    setPassword('');
    setActivePreset(null);
    setShowAdvanced(false);
  };

  const handleSave = async () => {
    const trimmedWebsite = websiteName.trim();
    if (!trimmedWebsite) {
      showToast('Error', 'Website Name is required', 'error');
      return;
    }

    const validCookies = cookies.filter((c) => c.name.trim() && c.value.trim());
    const hasUsername = username.trim();
    const hasPassword = password.trim();

    // Validasi sesuai jenis preset
    if (activePreset?.type === 'credentials') {
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

    try {
      await addEntry(
        trimmedWebsite,
        validCookies,
        hasUsername ? username.trim() : undefined,
        hasPassword ? password.trim() : undefined
      );
      resetForm();
      refreshEntries();
      showToast('Success', 'Entry added successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save entry. Please try again.';
      showToast('Error', message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEntry(id);
      refreshEntries();
      showToast('Deleted', 'Entry removed.', 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete entry. Please try again.';
      showToast('Error', message, 'error');
    }
  };

  const totalCookies = entries.reduce((sum, entry) => sum + entry.cookies.length, 0);

  return (
    <div className="fade-in">
      <Statistics activeEntries={entries.length} totalCookies={totalCookies} />

      {/* Preset Manager */}
      <PresetManager presets={presets} onPresetsChange={loadPresets} />

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
          <label className="block text-sm font-medium text-slate-400 mb-3">Quick Presets</label>
          <div className="space-y-4">
            {presets.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Belum ada preset. Buat preset di Kelola Preset di atas.</p>
            ) : (
              Object.entries(getPresetsByGroup(presets)).map(([groupName, groupPresets]) => (
                <div key={groupName} className="bg-dark-900/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {groupName === 'streaming' && <PlayCircle className="w-4 h-4 text-blue-400" />}
                    {groupName === 'ai' && <Brain className="w-4 h-4 text-green-400" />}
                    {!['streaming', 'ai'].includes(groupName) && <Settings className="w-4 h-4 text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {groupName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groupPresets.map((preset) => {
                      const isActive = activePreset?.id === preset.id;
                      let buttonClass = 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700/50';
                      let icon = null;

                      // Color coding based on type
                      if (preset.type === 'credentials') {
                        buttonClass = 'bg-purple-900/30 border-purple-800 text-purple-400 hover:bg-purple-900/50';
                        icon = <User className="w-3 h-3" />;
                      } else if (preset.type === 'full') {
                        buttonClass = 'bg-blue-900/30 border-blue-800 text-blue-400 hover:bg-blue-900/50';
                        icon = <Tv className="w-3 h-3" />;
                      } else {
                        buttonClass = 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50';
                        icon = <Film className="w-3 h-3" />;
                      }

                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={`flex items-center gap-2 px-3 py-1.5 border rounded transition-colors text-sm ${
                            isActive ? 'ring-2 ring-brand-500' : ''
                          } ${buttonClass}`}
                        >
                          {icon}
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div className="flex justify-end">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
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

        {/* Username & Password - hanya untuk preset credentials */}
        {activePreset?.type === 'credentials' && (
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
        {(!activePreset || activePreset.type !== 'credentials') && (
          <CookieForm 
            cookies={cookies} 
            onChange={setCookies} 
            showAdvanced={showAdvanced}
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

