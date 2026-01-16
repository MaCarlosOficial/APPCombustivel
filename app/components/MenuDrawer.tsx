import React, { useState } from 'react';
import { X, User, LogOut, Settings, Save, Star, Fuel } from 'lucide-react';
import { UserPreferences, Bandeira, FuelType } from '../types';
import { Button } from './Button';
import { ApiService } from '../services/apiService';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userId: string;
  userEmail: string;
  userToken: string;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ 
  isOpen, onClose, onLogout, userEmail, userToken, preferences, onUpdatePreferences 
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'profile'>('settings');
  const [profileForm, setProfileForm] = useState({ email: userEmail, password: '' });
  const [loading, setLoading] = useState(false);
  const [message] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.password) {
      console.log('Senha vazia, retornando');
      return;
    }
    
    setLoading(true);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex">
      {/* Overlay com fechamento ao clicar */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={() => {
          onClose();
        }}
      ></div>

      {/* Painel lateral com correção de largura e sombra */}
      <div className="relative w-[80%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        <div className="p-6 bg-blue-600 text-white shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Configurações</h2>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold border border-white/30">
              {userEmail && userEmail.length > 0 ? userEmail.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate text-sm">{userEmail || 'Usuário'}</p>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Conta Ativa</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex border-b sticky top-0 bg-white z-10">
            <button 
              onClick={() => {
                setActiveTab('settings');
              }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
            >
              <Settings size={16} /> Filtros
            </button>
            <button 
              onClick={() => {
                setActiveTab('profile');
              }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
            >
              <User size={16} /> Perfil
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'settings' ? (
              <div className="space-y-6">
                
                {/* Fuel Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <Fuel size={14} className="text-blue-500" />
                    Combustível no Mapa
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(FuelType).map((fuel) => (
                      <button
                        key={fuel}
                        onClick={() => onUpdatePreferences({ ...preferences, tipoCombustivel: fuel })}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm ${
                          preferences.tipoCombustivel === fuel 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200'
                        }`}
                      >
                        <span className="font-bold">{fuel}</span>
                        {preferences.tipoCombustivel === fuel && <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                        <Star size={18} className="fill-yellow-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Apenas Favoritos</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={preferences.showOnlyFavorites}
                        onChange={(e) => onUpdatePreferences({ ...preferences, showOnlyFavorites: e.target.checked })}
                      />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </div>
                  </label>
                </div>

                <div className="pt-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Bandeira de Preferência
                  </label>
                  <select 
                    value={preferences.bandeiraFavorita}
                    onChange={(e) => onUpdatePreferences({ ...preferences, bandeiraFavorita: e.target.value as any })}
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <option value="TODAS">Exibir Todas</option>
                    {Object.values(Bandeira).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-lg text-xs font-bold ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email Cadastrado</label>
                  <input 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Alterar Senha</label>
                  <input 
                    type="password" 
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Deixe em branco para manter"
                  />
                </div>
                <Button type="submit" isLoading={loading} className="text-sm">
                  <Save size={16} className="mr-2" /> Salvar Alterações
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 shrink-0">
          <Button variant="danger" onClick={onLogout} className="text-sm">
            <LogOut size={16} className="mr-2" /> Encerrar Sessão
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};