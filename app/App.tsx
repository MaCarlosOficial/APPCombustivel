import { AuthScreen } from './components/AuthScreen';
import { MapScreen } from './components/MapScreen';
import { MenuDrawer } from './components/MenuDrawer';
import { User, UserPreferences, FuelType } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favoriteStationIds, setFavoriteStationIds] = useState<string[]>([]);
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    bandeiraFavorita: 'TODAS',
    tipoCombustivel: FuelType.GASOLINA,
    showOnlyFavorites: false
  });

  const handleLoginSuccess = (loggedInUser: User) => {
    // LOG DE DEPURAÇÃO: Verificando o objeto que acaba de chegar
    if (!loggedInUser.token) {
      console.error('[App] ALERTA: Usuário recebido SEM TOKEN!');
    } else {
      console.log('[App] Token validado. Atualizando estado...');
    }
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
  };

  const toggleFavorite = (stationId: string) => {
    setFavoriteStationIds(prev => {
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId);
      }
      return [...prev, stationId];
    });
  };

  // Fixed: Replaced react-router-dom with state-based rendering to solve library export issues
  return (
    <div className="h-full w-full bg-gray-50 overflow-hidden text-gray-900 font-sans">
      {!user ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <MapScreen 
            token={user.token}
            onOpenMenu={() => setIsMenuOpen(true)} 
            preferences={preferences}
            favorites={favoriteStationIds}
            onToggleFavorite={toggleFavorite}
          />
          <MenuDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onLogout={handleLogout}
            userId={user.id}
            userEmail={user.email}
            userToken={user.token}
            preferences={preferences}
            onUpdatePreferences={setPreferences}
          />
        </>
      )}
    </div>
  );
}

export default App;