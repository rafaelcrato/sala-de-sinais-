import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import SignalCard from '../components/SignalCard';
import { SignalDuration } from '../types';
import { Filter, Zap, Activity, Bot, TrendingUp, Cpu } from 'lucide-react';
import { DURATION_OPTIONS, IMG_ROBOT_INTERFACE, IMG_BTC_3D_ICON } from '../constants';

const Dashboard: React.FC = () => {
  const { signals, botConfig } = useData();
  const [filterDuration, setFilterDuration] = useState<SignalDuration | 'all'>('all');

  const filteredSignals = signals.filter(s => {
      // Show active first, then expired sorted by date desc
      if (filterDuration !== 'all' && s.duration !== filterDuration) return false;
      return true;
  }).sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.createdAt - a.createdAt;
  });

  const activeCount = signals.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      
      {/* 1. STRATEGIC HERO SECTION - "The Master" */}
      <div className="relative rounded-[2rem] overflow-hidden bg-[#0a0a12] border border-gray-800 shadow-2xl min-h-[350px] flex items-center group">
         
         {/* Background Elements */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#0a0a12]/90 to-transparent"></div>
         </div>
         
         <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-[#001524] to-transparent opacity-50 z-0"></div>
         <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neon-blue/20 rounded-full blur-[100px] z-0"></div>

         <div className="relative z-10 w-full p-6 md:p-12 flex flex-col items-center justify-center text-center">
             
             {/* Main Content */}
             <div className="space-y-6 max-w-4xl mx-auto">
                 <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
                     <Cpu size={14} className="text-neon-blue" />
                     <span className="text-xs font-mono text-neon-blue tracking-widest uppercase">AI Trading Protocol V3.0</span>
                 </div>
                 
                 <div className="space-y-2">
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-gray-400">PRECISÃO</span> <br />
                        <span className="flex items-center justify-center gap-3 md:gap-4">
                            CIRÚRGICA
                            <img src={IMG_BTC_3D_ICON} alt="BTC" className="w-10 h-10 md:w-16 md:h-16 animate-bounce" style={{ animationDuration: '3s' }} />
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
                        O robô <span className="text-white font-bold">BTC Master Pro</span> analisa milhões de pontos de dados para entregar sinais de Bitcoin com expiração ultrarrápida.
                    </p>
                 </div>

                 {/* Stats Cards */}
                 <div className="flex flex-wrap justify-center gap-4 pt-4">
                     <div className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-2xl border border-gray-800 shadow-lg min-w-[140px] relative overflow-hidden">
                         <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                         <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Assertividade</span>
                         <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-mono text-gold font-bold leading-none">94.8%</span>
                            <TrendingUp size={18} className="text-gold mb-1" />
                         </div>
                     </div>
                     <div className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-2xl border border-gray-800 shadow-lg min-w-[140px]">
                         <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Sinais Hoje</span>
                         <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-mono text-neon-green font-bold leading-none">{signals.length}</span>
                            <Activity size={18} className="text-neon-green mb-1" />
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* 2. BOT STATUS BANNER - "The Interface" */}
      {botConfig.isActive && (
          <div className="relative rounded-2xl overflow-hidden border border-neon-blue/30 h-32 md:h-40 group">
              {/* Background Interface Robot */}
              <div className="absolute inset-0">
                  <img src={IMG_ROBOT_INTERFACE} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-700 transform group-hover:scale-105" alt="Bot Interface" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12] via-[#0a0a12]/80 to-transparent"></div>
              </div>

              <div className="relative z-10 h-full p-6 md:p-8 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 md:gap-6">
                      <div className="relative">
                          <div className="absolute inset-0 bg-neon-blue rounded-full blur animate-pulse"></div>
                          <div className="relative bg-black p-3 rounded-full border border-neon-blue text-neon-blue">
                              <Bot size={28} />
                          </div>
                      </div>
                      <div>
                          <h3 className="text-white font-bold text-lg md:text-2xl flex items-center gap-2">
                              SISTEMA AUTOMÁTICO <span className="text-neon-green text-xs border border-neon-green px-2 py-0.5 rounded uppercase tracking-wider">Online</span>
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-[200px] md:max-w-none">
                              IA escaneando o blockchain do Bitcoin. Próximo sinal em breve.
                          </p>
                      </div>
                  </div>

                  {/* Visual Timer Bar */}
                  <div className="hidden md:block w-1/3">
                      <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                          <span>PROCESSANDO DADOS</span>
                          <span>{botConfig.intervalSeconds}s INTERVALO</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-neon-blue to-purple-500 animate-progress-indeterminate"></div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 3. FILTERS & GRID */}
      <div className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b border-gray-800/50 md:border-none">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1 bg-card-bg border border-gray-800 p-1.5 rounded-xl shadow-lg">
                <div className="px-3 text-gray-500">
                    <Filter size={16} />
                </div>
                <button 
                    onClick={() => setFilterDuration('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterDuration === 'all' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    TODOS
                </button>
                {DURATION_OPTIONS.map(opt => (
                    <button 
                        key={opt.value}
                        onClick={() => setFilterDuration(opt.value as SignalDuration)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterDuration === opt.value ? 'bg-neon-blue text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        {opt.value.toUpperCase()}
                    </button>
                ))}
            </div>
          </div>
      </div>

      {/* Signals Grid - Fully Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredSignals.length > 0 ? (
            filteredSignals.map(signal => (
                <div key={signal.id} className="animate-slide-up">
                    <SignalCard signal={signal} />
                </div>
            ))
        ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-600 relative overflow-hidden">
                 
                <div className="relative mb-4 z-10">
                    <div className="absolute inset-0 bg-neon-blue/20 blur-xl rounded-full"></div>
                    <Zap size={64} className="relative text-gray-500" />
                </div>
                <p className="text-lg font-medium relative z-10">Aguardando oportunidades...</p>
                <div className="mt-6 flex gap-2 relative z-10">
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;