
import React, { useState } from 'react';
import { UserPlus, MoreHorizontal, Shield, Mail, Activity, Trash2, ExternalLink } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { UserRole, User } from '../../types';

const AgentManagement: React.FC = () => {
  const { agents, addAgent } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newAgent: User = {
      id: `agent-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: UserRole.AGENT,
      avatar: `https://picsum.photos/seed/${Math.random()}/200`,
      status: 'offline',
    };

    addAgent(newAgent);
    setNewName('');
    setNewEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Team Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Onboard and manage your customer support representatives.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 transform active:scale-95"
        >
          <UserPlus size={20} />
          Invite New Agent
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Team Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Permissions</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Connectivity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Workload</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={agent.avatar} alt="" className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          agent.status === 'online' ? 'bg-green-500' : 
                          agent.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <Mail size={12} />
                           <p className="text-xs font-medium">{agent.email}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                       agent.role === UserRole.SUPER_ADMIN ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                     }`}>
                       <Shield size={12} />
                       {agent.role === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Agent'}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                         agent.status === 'online' ? 'text-green-600 bg-green-50' : 
                         agent.status === 'busy' ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50'
                       }`}>
                         {agent.status.toUpperCase()}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {[1, 2].map(i => (
                            <div key={i} className="w-8 h-8 bg-white border-2 border-slate-50 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                               <Activity size={14} />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-400">2 Pages</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 hover:bg-white hover:shadow-md hover:text-blue-600 rounded-xl text-slate-400 transition-all">
                           <ExternalLink size={18} />
                        </button>
                        <button className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 transition-all">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Invite Agent</h3>
              <p className="text-slate-500 text-sm mb-8">Send an invitation to join your support team.</p>
              
              <form onSubmit={handleInvite} className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                   <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rachel Zane"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                   <input 
                    type="email" 
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="agent@company.com"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                   />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 text-sm font-bold bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"
                    >
                      Send Invite
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
