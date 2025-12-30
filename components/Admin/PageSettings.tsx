
import React, { useState, useEffect } from 'react';
import { Facebook, AlertCircle, RefreshCw, Trash2, ShieldCheck, Lock, Info, Loader2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { loginWithFacebook, fetchUserPages, initFacebookSDK, isSecureOrigin } from '../../services/facebookService';

const PageSettings: React.FC = () => {
  const { pages, addPage, removePage, simulateIncomingWebhook } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSecure = isSecureOrigin();

  useEffect(() => {
    initFacebookSDK().then(() => setSdkReady(true));
  }, []);

  const handleConnect = async () => {
    if (!sdkReady) {
      setError("Facebook SDK is still initializing. Please wait a moment.");
      return;
    }

    if (!isSecure) {
      setError("Meta requires HTTPS for Facebook Login. Please deploy with SSL or use localhost for testing.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      // 1. Trigger Real FB OAuth Popup (this now awaits init internally)
      await loginWithFacebook();
      
      // 2. Fetch the pages the user just authorized
      const userPages = await fetchUserPages();
      
      if (userPages.length === 0) {
        setError("No Facebook Pages found. Ensure you manage at least one page and granted the necessary permissions in the popup.");
      } else {
        userPages.forEach(p => addPage(p));
      }
    } catch (err: any) {
      console.error("Facebook Login Error:", err);
      setError(typeof err === 'string' ? err : 'Connection failed. Ensure your App ID is correct and you are using HTTPS.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Messenger Channels</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Connect real Facebook Pages via Graph API to start receiving messages.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleConnect}
            disabled={isConnecting || !sdkReady}
            className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl transform active:scale-95 disabled:opacity-50 ${
              !isSecure ? 'bg-slate-400 text-white cursor-not-allowed shadow-none' : 'bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-blue-200'
            }`}
          >
            {isConnecting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Facebook size={20} />
            )}
            {!sdkReady ? 'Initializing SDK...' : isConnecting ? 'Authenticating...' : 'Connect Facebook Page'}
          </button>
          {!isSecure && (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">
              <Lock size={12} /> HTTPS Required for Login
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="font-bold">Connection Issue</p>
            <p className="text-xs opacity-90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col group">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform">
                  <Facebook size={32} />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live Channel
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 truncate">{page.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{page.category}</p>
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-xs font-semibold text-slate-400">GRAPH API ID</span>
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{page.id}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-semibold text-slate-400">MESSENGER</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                    <ShieldCheck size={12} /> Full Messaging Enabled
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-auto p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
               <button 
                onClick={() => simulateIncomingWebhook(page.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
               >
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  Refresh Webhooks
               </button>
               <button 
                onClick={() => removePage(page.id)}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
               >
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm mb-6">
                <Facebook size={40} />
             </div>
             <h3 className="text-2xl font-bold text-slate-800">Connection Required</h3>
             <p className="text-slate-500 mt-2 max-w-xs px-4">Authenticate with Meta to discover your business pages and enable multi-agent support.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white rounded-[32px] border border-slate-100 flex items-start gap-4">
         <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
           <Info size={20} />
         </div>
         <div className="text-xs text-slate-500 leading-relaxed">
           <p className="font-bold text-slate-700 mb-1">Developer Requirements for Production:</p>
           <ul className="list-disc ml-4 space-y-1">
             <li>Replace <code className="bg-slate-100 px-1 rounded">YOUR_FB_APP_ID</code> in <code className="bg-slate-100 px-1 rounded">facebookService.ts</code>.</li>
             <li>Ensure the app is served via <strong>HTTPS</strong>. Meta strictly enforces this for all OAuth calls.</li>
             <li>Add <strong>Messenger</strong> and <strong>Facebook Login</strong> products in the Meta App Dashboard.</li>
             <li>Add your domain to the "Allowed Domains for the JavaScript SDK" in Facebook Login settings.</li>
           </ul>
         </div>
      </div>
    </div>
  );
};

export default PageSettings;
