import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { SignalDirection, SignalDuration } from '../types';
import { DURATION_OPTIONS } from '../constants';
import { 
    Radio, 
    Users, 
    DollarSign, 
    Trash2, 
    ArrowUpCircle, 
    ArrowDownCircle,
    Bot,
    Play,
    Pause,
    Zap
} from 'lucide-react';

const Admin: React.FC = () => {
  const { 
      signals, 
      addSignal, 
      deleteSignal, 
      getStats, 
      botConfig,
      updateBotConfig,
      generateManualBotSignal
  } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'signals' | 'overview' | 'bot'>('overview');

  // Form State
  const [direction, setDirection] = useState<SignalDirection>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [duration, setDuration] = useState<SignalDuration>('1m');
  const [notes, setNotes] = useState('');

  if (user?.role !== 'admin') {
      return <div className="p-10 text-center text-red-500">Acesso Negado</div>;
  }

  const handleCreateSignal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!entryPrice) return;
      
      const entry = parseFloat(entryPrice);
      // Auto calculate SL/TP based on mock strategy (e.g. 0.1% diff)
      const diff = entry * 0.0005; 
      
      const sl = direction === 'BUY' ? entry - diff : entry + diff;
      const tp = direction === 'BUY' ? entry + diff : entry - diff;

      addSignal({
          direction,
          entryPrice: entry,
          stopLoss: Number(sl.toFixed(2)),
          takeProfit: [Number(tp.toFixed(2))],
          duration,
          notes: notes || undefined
      });

      // Reset
      setEntryPrice('');
      setNotes('');
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
           <div className="flex bg-card-bg border border-gray-800 p-1 rounded-lg overflow-x-auto">
               <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'overview' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Visão Geral</button>
               <button onClick={() => setActiveTab('bot')} className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${activeTab === 'bot' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-400'}`}><Bot size={16}/> Auto Bot</button>
               <button onClick={() => setActiveTab('signals')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'signals' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Sinais Manuais</button>
           </div>
       </div>

       {activeTab === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                   { label: 'Sinais Enviados', val: stats.totalSignals, icon: <Radio className="text-purple-400" /> },
                   { label: 'Sinais Ativos', val: stats.activeSignals, icon: <Zap className="text-green-400" /> },
                   { label: 'Sinais Auto Bot', val: stats.botSignals, icon: <Bot className="text-neon-blue" /> },
                   { label: 'Bot Status', val: botConfig.isActive ? 'ONLINE' : 'OFFLINE', icon: <Bot className={botConfig.isActive ? "text-green-500" : "text-red-500"} /> },
               ].map((stat, i) => (
                   <div key={i} className="bg-card-bg p-6 rounded-xl border border-gray-800">
                       <div className="flex justify-between items-start">
                           <div>
                               <p className="text-gray-500 text-sm">{stat.label}</p>
                               <p className="text-2xl font-bold text-white mt-1">{stat.val}</p>
                           </div>
                           <div className="bg-gray-800 p-2 rounded-lg">{stat.icon}</div>
                       </div>
                   </div>
               ))}
           </div>
       )}

       {activeTab === 'bot' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card-bg p-6 rounded-xl border border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Bot className="text-neon-blue" /> Configuração do Bot
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${botConfig.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            {botConfig.isActive ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg border border-gray-700">
                             <div className="flex-1">
                                 <p className="text-sm font-medium text-white">Status do Robô</p>
                                 <p className="text-xs text-gray-500">Ligue para gerar sinais automaticamente.</p>
                             </div>
                             <button 
                                onClick={() => updateBotConfig({ isActive: !botConfig.isActive })}
                                className={`p-3 rounded-full transition-all ${botConfig.isActive ? 'bg-neon-green text-black hover:bg-green-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                             >
                                 {botConfig.isActive ? <Pause size={24} /> : <Play size={24} />}
                             </button>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Intervalo de Geração (segundos)</label>
                            <div className="flex gap-2">
                                {[15, 30, 60, 300].map(sec => (
                                    <button
                                        key={sec}
                                        onClick={() => updateBotConfig({ intervalSeconds: sec })}
                                        className={`flex-1 py-2 rounded border transition-all text-sm font-bold ${botConfig.intervalSeconds === sec ? 'bg-neon-blue text-black border-neon-blue' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                                    >
                                        {sec}s
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <button 
                                onClick={generateManualBotSignal}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg border border-gray-700 hover:border-neon-blue transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={16} className="text-gold" /> Forçar Sinal Aleatório Agora
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Últimos Sinais do Bot</h3>
                    {signals.filter(s => s.generatedBy === 'AUTO_BOT').slice(0, 5).map(signal => (
                        <div key={signal.id} className="bg-card-bg border border-gray-800 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${signal.direction === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {signal.direction === 'BUY' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                                </div>
                                <div>
                                    <div className="text-white font-mono text-sm">{signal.entryPrice}</div>
                                    <div className="text-[10px] text-gray-500">{new Date(signal.createdAt).toLocaleTimeString()} • {signal.duration}</div>
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${signal.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
                                {signal.status}
                            </span>
                        </div>
                    ))}
                    {signals.filter(s => s.generatedBy === 'AUTO_BOT').length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">Nenhum sinal do bot ainda.</div>
                    )}
                </div>
           </div>
       )}

       {activeTab === 'signals' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Create Form */}
               <div className="lg:col-span-1">
                   <div className="bg-card-bg p-6 rounded-xl border border-gray-800 sticky top-4">
                       <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                           <Radio size={18} className="text-neon-blue" /> Novo Sinal Manual
                       </h3>
                       <form onSubmit={handleCreateSignal} className="space-y-4">
                           <div className="grid grid-cols-2 gap-2">
                               <button 
                                type="button" 
                                onClick={() => setDirection('BUY')}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${direction === 'BUY' ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'border-gray-700 text-gray-500'}`}
                               >
                                   <ArrowUpCircle /> Compra
                               </button>
                               <button 
                                type="button" 
                                onClick={() => setDirection('SELL')}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${direction === 'SELL' ? 'bg-neon-red/20 border-neon-red text-neon-red' : 'border-gray-700 text-gray-500'}`}
                               >
                                   <ArrowDownCircle /> Venda
                               </button>
                           </div>

                           <div>
                               <label className="text-xs text-gray-400 mb-1 block">Preço de Entrada (BTC)</label>
                               <input 
                                value={entryPrice} 
                                onChange={e => setEntryPrice(e.target.value)}
                                type="number" 
                                className="w-full bg-dark-bg border border-gray-700 rounded p-2 text-white focus:border-neon-blue outline-none" 
                                placeholder="ex: 64500.50"
                                required
                               />
                           </div>

                           <div>
                               <label className="text-xs text-gray-400 mb-1 block">Expiração</label>
                               <select 
                                value={duration}
                                onChange={e => setDuration(e.target.value as SignalDuration)}
                                className="w-full bg-dark-bg border border-gray-700 rounded p-2 text-white focus:border-neon-blue outline-none"
                               >
                                   {DURATION_OPTIONS.map(opt => (
                                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                                   ))}
                               </select>
                           </div>

                           <div>
                               <label className="text-xs text-gray-400 mb-1 block">Observações (Opcional)</label>
                               <input 
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                type="text" 
                                className="w-full bg-dark-bg border border-gray-700 rounded p-2 text-white focus:border-neon-blue outline-none" 
                                placeholder="ex: Pullback na média"
                               />
                           </div>

                           <button type="submit" className="w-full bg-neon-blue hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors">
                               ENVIAR SINAL
                           </button>
                       </form>
                   </div>
               </div>

               {/* List */}
               <div className="lg:col-span-2 space-y-3">
                   <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Últimos Sinais (Todos)</h3>
                   {signals.map(signal => (
                       <div key={signal.id} className="bg-card-bg border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                           <div className="flex items-center gap-4">
                               <div className={`w-2 h-12 rounded-full ${signal.direction === 'BUY' ? 'bg-neon-green' : 'bg-neon-red'}`}></div>
                               <div>
                                   <div className="flex items-center gap-2">
                                       <span className={`font-bold ${signal.direction === 'BUY' ? 'text-neon-green' : 'text-neon-red'}`}>{signal.direction}</span>
                                       <span className="text-white font-mono">{signal.entryPrice}</span>
                                       {signal.generatedBy === 'AUTO_BOT' && (
                                           <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1 rounded flex items-center gap-1"><Bot size={10}/> BOT</span>
                                       )}
                                   </div>
                                   <div className="text-xs text-gray-500">
                                       {signal.duration} • {new Date(signal.createdAt).toLocaleTimeString()}
                                       <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${signal.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                                           {signal.status}
                                       </span>
                                   </div>
                               </div>
                           </div>
                           <button onClick={() => deleteSignal(signal.id)} className="p-2 hover:bg-red-500/20 hover:text-red-500 text-gray-600 rounded-full transition-colors">
                               <Trash2 size={18} />
                           </button>
                       </div>
                   ))}
               </div>
           </div>
       )}
    </div>
  );
};

export default Admin;