import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Calendar, ShieldCheck } from 'lucide-react';
import { DEFAULT_AVATAR } from '../constants';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card-bg border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-neon-blue/20 to-purple-500/20"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-card-bg bg-gray-700 overflow-hidden relative z-10">
                  <img src={user.avatar || DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left pb-2">
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-bg/50 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Calendar size={20} />
                  </div>
                  <div>
                      <p className="text-xs text-gray-500">Membro desde</p>
                      <p className="text-sm font-medium text-white">{new Date(user.joinedAt).toLocaleDateString()}</p>
                  </div>
              </div>
              
              <div className="bg-dark-bg/50 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                      <UserIcon size={20} />
                  </div>
                  <div>
                      <p className="text-xs text-gray-500">Função</p>
                      <p className="text-sm font-medium text-white font-mono uppercase">{user.role}</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;