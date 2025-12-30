
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Sidebar from './components/Sidebar';
import DashboardView from './components/Dashboard/DashboardView';
import InboxView from './components/Inbox/InboxView';
import AgentManagement from './components/Admin/AgentManagement';
import PageSettings from './components/Admin/PageSettings';
import { initFacebookSDK } from './services/facebookService';

const PortalContent: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSdkReady, setIsSdkReady] = useState(false);
  const { currentUser } = useApp();

  useEffect(() => {
    initFacebookSDK().then(() => setIsSdkReady(true));
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 max-w-md w-full text-center">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-blue-200">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
           </div>
           <h1 className="text-3xl font-bold text-slate-800 mb-2">Flow Portal</h1>
           <p className="text-slate-500 mb-8">Multi-agent support system for Facebook Messenger.</p>
           <button 
             onClick={() => window.location.reload()}
             className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
           >
             Get Started
           </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'inbox': return <InboxView />;
      case 'agents': return <AgentManagement />;
      case 'pages': return <PageSettings />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <div className="p-8 flex-1">
          {!isSdkReady && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
              Initializing Facebook Graph API Engine...
            </div>
          )}
          {renderView()}
        </div>
        <footer className="px-8 py-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center">
          MessengerFlow SaaS v1.1.0 • Live Assignment Engine Active
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <PortalContent />
    </AppProvider>
  );
};

export default App;
