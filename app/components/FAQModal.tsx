'use client';

import { useState } from 'react';
import { X, HelpCircle, Search, Code } from 'lucide-react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [activeTab, setActiveTab] = useState<'credentials' | 'snippets'>('credentials');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-dark-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-brand-400" />
            Tutorial & Panduan
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-dark-900">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-dark-800 text-brand-400 border-b-2 border-brand-500'
                : 'text-slate-400 hover:text-white hover:bg-dark-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            Credentials
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'snippets'
                ? 'bg-dark-800 text-brand-400 border-b-2 border-brand-500'
                : 'text-slate-400 hover:text-white hover:bg-dark-800/50'
            }`}
          >
            <Code className="w-4 h-4" />
            Snippets
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  Cara Menggunakan Credentials (Email & Password)
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Tutorial ini akan membantu Anda menggunakan email dan password yang di-share dari aplikasi ini untuk login ke website tujuan.
                </p>
              </div>

              <div className="bg-dark-900 border border-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-brand-300">Langkah-langkah:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-300">
                  <li>
                    <span className="font-medium text-white">Ke Website</span>
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-slate-400">
                      <li>Buka website atau aplikasi tujuan di browser Anda</li>
                      <li>Pastikan Anda berada di halaman utama website tersebut</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-medium text-white">Click Login</span>
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-slate-400">
                      <li>Cari dan klik tombol <span className="text-yellow-400">"Login"</span> atau <span className="text-yellow-400">"Sign In"</span></li>
                      <li>Anda akan diarahkan ke halaman login</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-medium text-white">Paste Sesuai dengan Valuenya</span>
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-slate-400">
                      <li>Di halaman login, cari field <span className="text-yellow-400">"Email"</span> atau <span className="text-yellow-400">"Username"</span></li>
                      <li>Copy email/username dari aplikasi ini (dari entry yang di-share admin)</li>
                      <li>Paste email/username tersebut ke field email di website tujuan</li>
                      <li>Copy password dari aplikasi ini</li>
                      <li>Paste password tersebut ke field password di website tujuan</li>
                      <li>Klik tombol <span className="text-yellow-400">"Login"</span> atau <span className="text-yellow-400">"Sign In"</span> untuk masuk</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-300">
                  <strong className="text-blue-200">Tips:</strong> Pastikan Anda menyalin email dan password dengan benar. Satu karakter yang salah bisa membuat login gagal.
                </p>
              </div>

              <div className="bg-dark-900 border border-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-brand-300 mb-2">Contoh:</h4>
                <div className="text-xs text-slate-400 font-mono bg-dark-800 p-3 rounded border border-slate-700 space-y-1">
                  <div>Dari aplikasi ini:</div>
                  <div className="ml-4">Email: <span className="text-white">user@example.com</span></div>
                  <div className="ml-4">Password: <span className="text-white">********</span></div>
                  <div className="mt-2 text-green-400">↓ Paste ke website tujuan ↓</div>
                  <div className="mt-2">Field Email: <span className="text-white">user@example.com</span></div>
                  <div>Field Password: <span className="text-white">********</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'snippets' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Tutorial & Panduan Snippets
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Gunakan cara ini untuk menjalankan script cookie injector langsung dari DevTools browser.
                </p>
              </div>

              <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-purple-300">Langkah-langkah:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                  <li>
                    Buka website tujuan, lalu <span className="text-yellow-400">klik kanan → Inspect</span>
                  </li>
                  <li>
                    Masuk ke tab <span className="text-yellow-400">Sources</span> → <span className="text-yellow-400">Snippets</span>
                  </li>
                  <li>
                    Klik <span className="text-yellow-400">+ New Snippet</span>
                  </li>
                  <li>
                    Paste script snippet hasil copy dari tombol <span className="text-yellow-400">Copy Snippet</span> di aplikasi ini
                  </li>
                  <li>
                    Klik kanan di area snippet, lalu pilih <span className="text-yellow-400">Run</span>
                  </li>
                </ol>
              </div>
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-300">
                  <strong className="text-blue-200">Tips:</strong> Jika belum ada script, klik tombol <span className="font-semibold text-blue-200">Copy Snippet</span> pada kartu cookie, lalu paste ke Snippets dan jalankan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-dark-900">
          <button
            onClick={onClose}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

