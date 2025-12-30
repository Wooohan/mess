
import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  Facebook
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { currentUser, logout } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.AGENT] },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare, roles: [UserRole.SUPER_ADMIN, UserRole.AGENT] },
    { id: 'agents', label: 'Agents', icon: Users, roles: [UserRole.SUPER_ADMIN] },
    { id: 'pages', label: 'FB Pages', icon: Facebook, roles: [UserRole.SUPER_ADMIN] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [UserRole.SUPER_ADMIN, UserRole.AGENT] },
  ];

  const filteredItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <MessageSquare size={24} />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">Flow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4">
          <img src={currentUser?.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.name}</p>
            <div className="flex items-center gap-1">
               <ShieldCheck size={12} className={currentUser?.role === UserRole.SUPER_ADMIN ? 'text-amber-500' : 'text-blue-500'} />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                 {currentUser?.role === UserRole.SUPER_ADMIN ? 'Admin' : 'Agent'}
               </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
