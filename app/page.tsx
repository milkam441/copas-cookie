'use client';

import { useState } from 'react';
import { Cookie, ShieldCheck, Users, HelpCircle } from 'lucide-react';
import AdminTab from './components/AdminTab';
import UserTab from './components/UserTab';
import { ToastProvider } from './components/ToastContext';
import FAQModal from './components/FAQModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="bg-dark-900 text-slate-200 min-h-screen flex flex-col items-center p-4">
        <div className="w-full max-w-5xl">
        {/* Header */}
        <header className="mb-8 text-center pt-6 relative">
          <button
            onClick={() => setIsFAQOpen(true)}
            className="absolute top-6 right-0 p-2 text-slate-400 hover:text-brand-400 hover:bg-dark-800 rounded-lg transition-all duration-200 flex items-center gap-2"
            title="Buka Tutorial & Panduan"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">FAQ</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex justify-center items-center gap-2">
            <Cookie className="text-yellow-500 w-8 h-8" />
            Cookie Manager
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Secure Cookie Storage & Sharing System (1-Hour Auto Delete)
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-dark-800 p-1 rounded-lg inline-flex shadow-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'user'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Public User
            </button>
          </div>
        </div>

          {/* Tab Content */}
          {activeTab === 'admin' ? <AdminTab /> : <UserTab />}
        </div>
      </div>
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
    </ToastProvider>
  );
}
