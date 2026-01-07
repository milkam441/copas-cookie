'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Preset, PresetCookie } from '@/app/types';
import { createPreset, updatePreset, deletePreset } from '@/app/utils/presetApi';
import { useToast } from './ToastContext';

interface PresetManagerProps {
  presets: Preset[];
  onPresetsChange: () => void;
}

type PresetFormData = {
  key: string;
  type: 'simple' | 'full' | 'credentials';
  name: string;
  group: string;
  cookies: PresetCookie[];
};

const emptyForm: PresetFormData = {
  key: '',
  type: 'simple',
  name: '',
  group: 'streaming',
  cookies: [{ name: '' }],
};

export default function PresetManager({ presets, onPresetsChange }: PresetManagerProps) {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PresetFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (preset: Preset) => {
    setFormData({
      key: preset.key,
      type: preset.type,
      name: preset.name,
      group: preset.group,
      cookies: preset.cookies.length > 0 ? preset.cookies : [{ name: '' }],
    });
    setEditingId(preset.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus preset ini?')) return;
    
    try {
      await deletePreset(id);
      onPresetsChange();
      showToast('Deleted', 'Preset berhasil dihapus', 'info');
    } catch (error) {
      showToast('Error', 'Gagal menghapus preset', 'error');
    }
  };

  const addCookieField = () => {
    setFormData({
      ...formData,
      cookies: [...formData.cookies, { name: '' }],
    });
  };

  const removeCookieField = (index: number) => {
    const newCookies = formData.cookies.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      cookies: newCookies.length > 0 ? newCookies : [{ name: '' }],
    });
  };

  const updateCookieField = (index: number, field: keyof PresetCookie, value: any) => {
    const newCookies = [...formData.cookies];
    newCookies[index] = { ...newCookies[index], [field]: value };
    setFormData({ ...formData, cookies: newCookies });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key.trim() || !formData.name.trim() || !formData.group.trim()) {
      showToast('Error', 'Key, Name, dan Group wajib diisi', 'error');
      return;
    }

    // Filter empty cookies
    const validCookies = formData.cookies.filter((c) => c.name.trim());
    
    // For non-credentials type, require at least one cookie
    if (formData.type !== 'credentials' && validCookies.length === 0) {
      showToast('Error', 'Minimal satu cookie diperlukan untuk tipe ini', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const presetData = {
        ...formData,
        cookies: validCookies,
      };

      if (editingId) {
        await updatePreset(editingId, presetData);
        showToast('Updated', 'Preset berhasil diupdate', 'success');
      } else {
        await createPreset(presetData);
        showToast('Created', 'Preset berhasil dibuat', 'success');
      }

      resetForm();
      onPresetsChange();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal menyimpan preset', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupIcons: Record<string, string> = {
    streaming: '🎬',
    ai: '🤖',
    social: '👥',
    productivity: '📊',
    gaming: '🎮',
    other: '📦',
  };

  return (
    <div className="bg-dark-800 border border-slate-700 rounded-xl p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          Kelola Preset
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Add Button */}
          {!isFormOpen && (
            <button
              onClick={() => {
                setFormData(emptyForm);
                setEditingId(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Preset Baru
            </button>
          )}

          {/* Form */}
          {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-dark-900 border border-slate-600 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">
                  {editingId ? 'Edit Preset' : 'Preset Baru'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Key (ID unik)</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="netflix, chatgpt, dll"
                    className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nama Display</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Netflix, ChatGPT, dll"
                    className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-sm text-white focus:border-brand-500 outline-none"
                  >
                    <option value="simple">Simple (Cookie names saja)</option>
                    <option value="full">Full (Cookie dengan detail lengkap)</option>
                    <option value="credentials">Credentials (Username/Password)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Grup</label>
                  <input
                    type="text"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    placeholder="streaming, ai, social, dll"
                    className="w-full bg-dark-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Cookie Fields - only for non-credentials type */}
              {formData.type !== 'credentials' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs text-slate-400">Cookie Template</label>
                    <button
                      type="button"
                      onClick={addCookieField}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Tambah Cookie
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.cookies.map((cookie, index) => (
                      <div key={index} className="bg-dark-800 border border-slate-700 rounded-md p-2">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={cookie.name}
                              onChange={(e) => updateCookieField(index, 'name', e.target.value)}
                              placeholder="Cookie Name"
                              className="w-full bg-dark-900 border border-slate-600 rounded p-1.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none"
                            />
                            {formData.type === 'full' && (
                              <>
                                <input
                                  type="text"
                                  value={cookie.domain || ''}
                                  onChange={(e) => updateCookieField(index, 'domain', e.target.value || undefined)}
                                  placeholder="Domain (e.g. .example.com)"
                                  className="w-full bg-dark-900 border border-slate-600 rounded p-1.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none"
                                />
                                <div className="flex gap-2 flex-wrap">
                                  <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={cookie.httpOnly || false}
                                      onChange={(e) => updateCookieField(index, 'httpOnly', e.target.checked)}
                                      className="w-3 h-3"
                                    />
                                    HttpOnly
                                  </label>
                                  <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={cookie.secure || false}
                                      onChange={(e) => updateCookieField(index, 'secure', e.target.checked)}
                                      className="w-3 h-3"
                                    />
                                    Secure
                                  </label>
                                  <select
                                    value={cookie.sameSite || ''}
                                    onChange={(e) => updateCookieField(index, 'sameSite', e.target.value || undefined)}
                                    className="bg-dark-900 border border-slate-600 rounded p-1 text-xs text-white focus:border-brand-500 outline-none"
                                  >
                                    <option value="">SameSite</option>
                                    <option value="Strict">Strict</option>
                                    <option value="Lax">Lax</option>
                                    <option value="None">None</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={cookie.prioritas || ''}
                                    onChange={(e) => updateCookieField(index, 'prioritas', e.target.value || undefined)}
                                    placeholder="Prioritas"
                                    className="bg-dark-900 border border-slate-600 rounded p-1 text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none w-20"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCookieField(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.type === 'credentials' && (
                <p className="text-xs text-slate-500 italic">
                  Tipe credentials hanya memerlukan username/password, tidak perlu cookie template.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Menyimpan...' : editingId ? 'Update Preset' : 'Simpan Preset'}
              </button>
            </form>
          )}

          {/* Preset List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Preset Tersedia ({presets.length})</h4>
            {presets.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Belum ada preset. Buat preset baru di atas.</p>
            ) : (
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between bg-dark-900 border border-slate-700 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{groupIcons[preset.group] || '📦'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{preset.name}</span>
                          <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                            {preset.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {preset.group} • {preset.cookies.length} cookies
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(preset)}
                        className="p-1.5 text-slate-400 hover:text-brand-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(preset.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
