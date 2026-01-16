import React, { useState } from 'react';
import { ApiService } from '../services/apiService';
import { User } from '../types';
import { Button } from './Button';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import iconeApp from '../assets/iconeApp.jpg';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user;
      if (isLogin) {
        user = await ApiService.login(email, password);
      } else {
        user = await ApiService.register(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-blue-600 flex-1 flex flex-col items-center justify-center p-10 text-white rounded-b-[3rem] shadow-2xl z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700/50 transform rotate-12 scale-150 rounded-[3rem] -z-10 translate-y-20"></div>
        <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm">
          <img src={iconeApp} alt="Ícone do app" className="w-12 h-12 object-cover rounded-full" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Combustível Barato</h1>
        <p className="text-blue-100 text-center">Encontre o melhor preço de combustível ao seu redor.</p>
      </div>

      {/* Form Section */}
      <div className="flex-[1.5] p-8 flex flex-col justify-center max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com ou usário"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Sua senha secreta"
                required
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="mt-4">
            {isLogin ? 'Entrar' : 'Cadastrar e Entrar'} 
            {!loading && <ChevronRight size={20} className="ml-1" />}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </p>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-semibold mt-1 hover:underline"
          >
            {isLogin ? 'Criar conta gratuitamente' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
};