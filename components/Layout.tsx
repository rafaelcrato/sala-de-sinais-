import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  History, 
  User, 
  Settings, 
  HelpCircle
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user } = useAuth();

  const menuItems = [
    { icon: <Home size={20} />, label: 'Sinais', path: '/' },
    { icon: <History size={20} />, label: 'Histórico', path: '/history' },
    { icon: <User size={20} />, label: 'Perfil', path: '/profile' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ icon: <Settings size={20} />, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col md:flex-row font-sans selection:bg-neon-blue selection:text-black">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card-bg border-r border-gray-800 h-screen sticky top-0">
        <div className="p-6 flex items-center justify-center">
          <h1 className="text-xl font-bold text-neon-blue tracking-wider">BTC MASTER PRO</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-neon-blue/20 to-transparent text-neon-blue border-l-2 border-neon-blue' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`
              }
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
           <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
              <HelpCircle size={16} /> Suporte
           </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card-bg border-b border-gray-800 sticky top-0 z-20">
            <h1 className="text-lg font-bold text-neon-blue">BTC MASTER PRO</h1>
            <div className="flex gap-4">
                {user?.role === 'admin' && (
                    <NavLink to="/admin" className="text-gray-400">
                        <Settings size={20} />
                    </NavLink>
                )}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8 md:p-8">
            <Outlet />
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card-bg/95 backdrop-blur border-t border-gray-800 flex justify-around p-3 z-50 pb-safe">
            {menuItems.map((item) => (
                <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive ? 'text-neon-blue' : 'text-gray-500'
                    }`
                }
                >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
            ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;