import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ApiService } from '../services/apiService';
import { GasStation, Bandeira, UserPreferences } from '../types';
import { Menu as MenuIcon, Star, Fuel, AlertCircle, Clock } from 'lucide-react';

const MapController = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const createPriceIcon = (price: number, bandeira: string, isFavorite: boolean) => {
  const colorClass = bandeira === Bandeira.IPIRANGA ? 'bg-yellow-500' 
                   : bandeira === Bandeira.SHELL ? 'bg-red-500'
                   : bandeira === Bandeira.BR ? 'bg-green-500'
                   : bandeira === Bandeira.RAIZEN ? 'bg-purple-500'
                   : bandeira === Bandeira.VIBRA ? 'bg-gray-500'
                   : bandeira === Bandeira.ALE ? 'bg-white-500'
                   : 'bg-blue-600';
  
  const borderClass = isFavorite ? 'border-yellow-400 border-4 scale-110' : 'border-white border-2';
  const starBadge = isFavorite ? `<div class="absolute -top-2 -right-2 text-lg drop-shadow-md">⭐</div>` : '';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="relative ${colorClass} text-white font-bold px-2 py-1 rounded-lg shadow-lg text-sm whitespace-nowrap ${borderClass} transition-transform">
             R$ ${price.toFixed(2)}
             ${starBadge}
           </div>`,
    iconSize: [65, 34],
    iconAnchor: [32, 34]
  });
};

interface MapScreenProps {
  token: string;
  onOpenMenu: () => void;
  preferences: UserPreferences;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ 
  token,
  onOpenMenu, 
  preferences,
  favorites,
  onToggleFavorite 
}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [allStations, setAllStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchPos = useRef<{ lat: number, lng: number } | null>(null);

  // LOG DE DEPURAÇÃO: Verificar se o token chegou no componente
  useEffect(() => {
    console.log('[MapScreen] Renderizado. Token recebido:', token ? `${token.substring(0, 10)}...` : 'VAZIO');
  }, [token]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada.");
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setLoading(false);

        const shouldFetch = !lastFetchPos.current || 
          calculateDistance(lastFetchPos.current.lat, lastFetchPos.current.lng, latitude, longitude) > 0.5;

        if (shouldFetch) {
          fetchStations(latitude, longitude);
          lastFetchPos.current = { lat: latitude, lng: longitude };
        }
      },
      () => {
        setError("GPS desativado. Ative para localizar postos.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchStations = async (lat: number, lng: number) => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const data = await ApiService.getStationsNear(token, lat, lng, 5); 
      setAllStations(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erro ao carregar postos.");
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 1. Filtrar os postos para exibição dos Marcadores baseados no tipo favorito
  const filteredStationsForMarkers = allStations.filter(station => {
    const isFavorite = favorites.includes(String(station.id));
    const matchesFuel = station.produto.toUpperCase() === preferences.tipoCombustivel.toUpperCase();
    const matchesBandeira = preferences.bandeiraFavorita === 'TODAS' || station.bandeira === preferences.bandeiraFavorita;
    const matchesShowFavorites = !preferences.showOnlyFavorites || isFavorite;
    
    return matchesFuel && matchesBandeira && matchesShowFavorites;
  });

  if (loading || !position) {
    return (
      <div className="flex h-full items-center justify-center bg-blue-600">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white font-medium">Localizando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Botão Menu com StopPropagation e Z-Index altíssimo */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onOpenMenu();
        }}
        className="absolute top-4 left-4 z-[2000] bg-white p-3 rounded-full shadow-xl text-gray-700 active:scale-90 transition-transform pointer-events-auto border border-gray-100"
      >
        <MenuIcon size={24} />
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-bold text-blue-600 flex items-center gap-2 border border-blue-100">
          <Fuel size={16} />
          {preferences.tipoCombustivel}
        </div>
        
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

      </div>

      <MapContainer 
        center={[position.lat, position.lng]} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController lat={position.lat} lng={position.lng} />

        <Marker position={[position.lat, position.lng]}>
          <Popup>Você está aqui</Popup>
        </Marker>

        {filteredStationsForMarkers.map(station => {
          const isFavorite = favorites.includes(String(station.id));
          
          // Buscar todos os combustíveis desta mesma revenda para o Popup
          const otherFuels = allStations.filter(s => s.id_revenda === station.id_revenda);

          return (
            <Marker 
              key={`${station.id}-${station.produto}`}
              position={[station.latitude, station.longitude]}
              icon={createPriceIcon(station.valor_venda, station.bandeira, isFavorite)}
            >
              <Popup>
                <div className="min-w-[240px] p-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-lg leading-tight text-gray-900">{station.nome}</h3>
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1">
                        {station.bandeira}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(String(station.id));
                      }} 
                      className="p-1"
                    >
                      <Star size={24} className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Preços no Local</p>
                    <div className="grid grid-cols-1 gap-2">
                      {otherFuels.map(f => (
                        <div key={f.id} className={`flex justify-between items-center p-2 rounded-lg ${f.produto === station.produto ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                          <span className={`text-xs ${f.produto === station.produto ? 'font-bold text-blue-700' : 'text-gray-600'}`}>
                            {f.produto}
                          </span>
                          <span className={`text-sm font-black ${f.produto === station.produto ? 'text-blue-700' : 'text-gray-900'}`}>
                            R$ {f.valor_venda.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 border-t pt-2">
                    <Clock size={10} />
                    <span>Atualizado em {new Date(station.atualizado_em).toLocaleDateString()}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};