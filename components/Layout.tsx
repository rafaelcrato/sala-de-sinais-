
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Settings, 
  HelpCircle
} from 'lucide-react';
import { IMG_LOGO } from '../constants';

const Layout: React.FC = () => {
  const { user } = useAuth();

  const menuItems = [
    { icon: <Home size={24} />, label: 'Sinais', path: '/' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ icon: <Settings size={24} />, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col font-sans selection:bg-neon-blue selection:text-black">
      
      {/* Header - Strategic Logo Placement */}
      <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4 bg-card-bg/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30 shadow-lg">
          <div className="flex items-center gap-4">
              {/* Logo Image */}
              <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-blue-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                  <div className="relative w-12 h-12 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center p-2 border border-gray-800">
                      <img src={IMG_LOGO} alt="Logo" className="w-full h-full object-contain" />
                  </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-wider leading-none">
                  BTC <span className="text-neon-blue">MASTER</span> PRO
                </h1>
                <span className="text-[10px] md:text-xs text-gray-400 font-mono tracking-[0.2em] uppercase mt-1">
                  System Intelligence
                </span>
              </div>
          </div>
          
          <div className="flex gap-4">
              <a href="https://wa.me/5511937561237" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-neon-green transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5">
                  <HelpCircle size={18} /> <span className="hidden sm:inline">Suporte</span>
              </a>
          </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        <div className="flex-1 overflow-y-auto w-full">
            <div className="max-w-[1400px] mx-auto p-4 pb-28 md:p-6 md:pb-12 w-full">
                <Outlet />
            </div>
        </div>
      </main>

      {/* Bottom Nav - Responsive Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f16]/95 backdrop-blur-lg border-t border-gray-800 flex justify-around items-center p-2 z-50 pb-safe md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          {menuItems.map((item) => (
              <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 relative overflow-hidden ${
                  isActive ? 'text-neon-blue' : 'text-gray-500 hover:text-gray-300'
                  }`
              }
              >
              {({ isActive }) => (
                  <>
                    <div className={`absolute inset-0 bg-neon-blue/10 blur-xl transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : ''}`}>
                        {item.icon}
                    </div>
                    <span className={`relative text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                        {item.label}
                    </span>
                    {isActive && <div className="absolute bottom-0 w-8 h-1 bg-neon-blue rounded-t-full shadow-[0_0_10px_#00f3ff]" />}
                  </>
              )}
              </NavLink>
          ))}
      </nav>

      {/* Desktop Floating Navigation (Bottom Center) */}
      <div className="hidden md:flex fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#13131f]/90 backdrop-blur-md border border-gray-700 rounded-full px-8 py-3 gap-8 shadow-2xl z-40 hover:scale-105 transition-transform duration-300">
           {menuItems.map((item) => (
              <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-r from-neon-blue to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
              }
              >
                 {item.icon}
                 <span className="text-sm uppercase tracking-wide">{item.label}</span>
              </NavLink>
          ))}
      </div>
    </div>
  );
};

export default Layout;
