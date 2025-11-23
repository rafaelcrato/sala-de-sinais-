import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import SignalCard from '../components/SignalCard';
import { SignalDuration } from '../types';
import { Filter, Zap } from 'lucide-react';
import { DURATION_OPTIONS } from '../constants';

const Dashboard: React.FC = () => {
  const { signals } = useData();
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero / Stats */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-20">
            <Zap size={100} className="text-neon-blue" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-1">Sinais ao Vivo</h2>
         <p className="text-gray-400 text-sm mb-4">Acompanhe as oportunidades de entrada no BTC em tempo real.</p>
         
         <div className="flex gap-4">
             <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block">Sinais Ativos</span>
                 <span className="text-xl font-mono text-neon-green font-bold">
                    {signals.filter(s => s.status === 'active').length}
                 </span>
             </div>
             <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block">Win Rate (24h)</span>
                 <span className="text-xl font-mono text-gold font-bold">87%</span>
             </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
         <div className="flex items-center gap-2 bg-card-bg border border-gray-800 p-1.5 rounded-lg">
            <Filter size={16} className="text-gray-500 ml-2" />
            <button 
                onClick={() => setFilterDuration('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterDuration === 'all' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
            >
                Todos
            </button>
            {DURATION_OPTIONS.map(opt => (
                <button 
                    key={opt.value}
                    onClick={() => setFilterDuration(opt.value as SignalDuration)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all ${filterDuration === opt.value ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    {opt.value}
                </button>
            ))}
         </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length > 0 ? (
            filteredSignals.map(signal => (
                <SignalCard key={signal.id} signal={signal} />
            ))
        ) : (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                    <Zap size={32} className="text-gray-600" />
                </div>
                <p>Nenhum sinal encontrado para este filtro.</p>
                <p className="text-xs mt-2">Aguarde o admin enviar novas entradas.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
