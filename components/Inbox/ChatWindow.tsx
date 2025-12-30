
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  MoreVertical, 
  Phone, 
  Video,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Conversation, Message, ConversationStatus } from '../../types';
import { useApp } from '../../store/AppContext';
import { getSmartReplySuggestion } from '../../services/geminiService';
import { sendPageMessage } from '../../services/facebookService';

interface ChatWindowProps {
  conversation: Conversation;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const { currentUser, messages, addMessage, updateConversation, pages } = useApp();
  const [inputText, setInputText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages.filter(m => m.conversationId === conversation.id);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    
    setIsSending(true);
    setLastError(null);
    const currentPage = pages.find(p => p.id === conversation.pageId);
    
    // 1. Optimistic UI update
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser?.id || 'unknown',
      senderName: currentUser?.name || 'Agent',
      text: inputText,
      timestamp: new Date().toISOString(),
      isIncoming: false,
      isRead: true,
    };

    try {
      // 2. Real Graph API Call
      if (currentPage && currentPage.accessToken && !currentPage.accessToken.startsWith('EAAb')) {
        await sendPageMessage(conversation.customerId, inputText, currentPage.accessToken);
      }
      
      // Success: add to UI
      addMessage(newMessage);
      setInputText('');
    } catch (err: any) {
      console.error("Facebook Send Failure:", err);
      setLastError(err.message || 'Graph API rejected the message. Check your Page Access Token permissions.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    const context = chatMessages.slice(-8).map(m => `${m.senderName}: ${m.text}`).join('\n');
    const suggestion = await getSmartReplySuggestion(context || conversation.lastMessage);
    setInputText(suggestion);
    setIsSuggesting(false);
  };

  const setStatus = (status: ConversationStatus) => {
    updateConversation(conversation.id, { status });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={conversation.customerAvatar} alt={conversation.customerName} className="w-10 h-10 rounded-full object-cover" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 leading-tight">{conversation.customerName}</h3>
            <div className="flex items-center gap-2">
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                 conversation.status === ConversationStatus.OPEN ? 'bg-green-100 text-green-700' :
                 conversation.status === ConversationStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                 'bg-slate-100 text-slate-700'
               }`}>
                 {conversation.status}
               </span>
               <span className="text-slate-300">•</span>
               <p className="text-[10px] text-slate-400 font-medium">Live Messenger</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex items-center bg-slate-50 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setStatus(ConversationStatus.OPEN)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${conversation.status === ConversationStatus.OPEN ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Open
              </button>
              <button 
                onClick={() => setStatus(ConversationStatus.RESOLVED)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${conversation.status === ConversationStatus.RESOLVED ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Resolve
              </button>
           </div>
           <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 max-w-xs text-center italic text-xs">
                "{conversation.lastMessage}"
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">New Facebook Thread</p>
          </div>
        )}
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isIncoming ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[75%] group">
              <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.isIncoming ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
              <div className={`flex items-center gap-2 mt-1 px-1 ${msg.isIncoming ? 'justify-start' : 'justify-end'}`}>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {!msg.isIncoming && <span className="text-blue-500"><CheckCircle2 size={10} /></span>}
              </div>
            </div>
          </div>
        ))}
        {lastError && (
          <div className="flex justify-center p-2">
             <div className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-red-100">
               <AlertCircle size={14} /> {lastError}
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleSuggest}
              disabled={isSuggesting}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isSuggesting ? 'Thinking...' : 'AI Suggest Reply'}
            </button>
            {conversation.status === ConversationStatus.RESOLVED && (
               <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12} /> Resolved</span>
            )}
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Reply as the Facebook Page..."
                className="w-full bg-transparent p-4 resize-none text-sm outline-none max-h-32"
                rows={1}
                disabled={isSending}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isSending}
              className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
