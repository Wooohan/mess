
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MapPin, 
  Mail, 
  Clock, 
  UserPlus, 
  ExternalLink,
  MessageSquareOff,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Conversation, ConversationStatus } from '../../types';
import ChatWindow from './ChatWindow';

const InboxView: React.FC = () => {
  const { conversations, currentUser, agents, updateConversation } = useApp();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConvId) || null;

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'ALL' || conv.status === filter;
    const matchesSearch = conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isAssignedToMe = conv.assignedAgentId === currentUser?.id;
    const isAdmin = currentUser?.role === 'SUPER_ADMIN';

    return matchesFilter && matchesSearch && (isAdmin || isAssignedToMe);
  });

  const handleAssign = (agentId: string | null) => {
    if (activeConv) {
      updateConversation(activeConv.id, { assignedAgentId: agentId });
      setShowAssignMenu(false);
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
      {/* List Panel */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Messages</h2>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Filter size={18} /></button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Use ConversationStatus enum members directly to satisfy TypeScript strict enum checking */}
            {(['ALL', ConversationStatus.OPEN, ConversationStatus.PENDING, ConversationStatus.RESOLVED] as const).map((stat) => (
              <button
                key={stat}
                onClick={() => setFilter(stat)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filter === stat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100 scale-105' 
                    : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-4 transition-all border-l-4 ${
                  activeConv?.id === conv.id 
                    ? 'bg-white border-blue-600 shadow-sm' 
                    : 'border-transparent hover:bg-white/60'
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img src={conv.customerAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-semibold text-slate-800 truncate text-sm">{conv.customerName}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs truncate mb-2 ${conv.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                      {conv.lastMessage}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${
                        conv.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        conv.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {conv.status}
                      </span>
                      {conv.assignedAgentId && (
                        <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded">
                           <UserCheck size={10} className="text-blue-600" />
                           <span className="text-[8px] font-bold text-blue-600 truncate max-w-[40px]">
                             {agents.find(a => a.id === conv.assignedAgentId)?.name.split(' ')[0]}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 opacity-50">
              <MessageSquareOff size={48} />
              <p className="mt-4 text-sm font-medium">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white flex flex-col border-r border-slate-100">
        {activeConv ? (
          <ChatWindow conversation={activeConv} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 bg-slate-50/20">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
               <MessageSquareOff size={40} className="text-slate-300" />
             </div>
             <h2 className="text-xl font-semibold text-slate-700">Ready to respond?</h2>
             <p className="text-sm mt-2 text-center max-w-xs">Select a conversation from the sidebar to start a real-time interaction.</p>
          </div>
        )}
      </div>

      {/* Profile/Detail Panel */}
      {activeConv && (
        <div className="w-72 flex flex-col overflow-y-auto bg-slate-50/30">
          <div className="p-6 text-center border-b border-slate-100 bg-white shadow-sm">
            <img src={activeConv.customerAvatar} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 shadow-md object-cover" />
            <h3 className="font-bold text-slate-800 text-lg">{activeConv.customerName}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {activeConv.customerId}</p>
            <div className="mt-6 flex gap-2 justify-center">
              <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Mail size={16} /></button>
              <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><UserPlus size={16} /></button>
              <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><ExternalLink size={16} /></button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Details</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400"><MapPin size={14} /></div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Location</p>
                    <p className="text-slate-500">New York, USA</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400"><Clock size={14} /></div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">First Contact</p>
                    <p className="text-slate-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assignment</h4>
              <button 
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <UserCheck size={16} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-none mb-1">Assigned Agent</p>
                      <span className="text-sm font-bold text-slate-800 truncate block">
                        {activeConv.assignedAgentId 
                          ? agents.find(a => a.id === activeConv.assignedAgentId)?.name 
                          : 'Unassigned'}
                      </span>
                   </div>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showAssignMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAssignMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
                  <div className="max-h-48 overflow-y-auto">
                    <button 
                      onClick={() => handleAssign(null)}
                      className="w-full p-4 text-left text-sm text-red-500 font-bold hover:bg-slate-50 border-b border-slate-50"
                    >
                      Unassign
                    </button>
                    {agents.map(agent => (
                      <button 
                        key={agent.id}
                        onClick={() => handleAssign(agent.id)}
                        className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50 ${activeConv.assignedAgentId === agent.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <img src={agent.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <span className="text-sm font-semibold text-slate-700">{agent.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Internal Notes</h4>
              <textarea 
                placeholder="Write a private note..."
                className="w-full h-32 p-4 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none shadow-sm"
              />
              <p className="text-[9px] text-slate-400 mt-2 italic">* These notes are only visible to your team.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxView;
