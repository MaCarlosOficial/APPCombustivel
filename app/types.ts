export interface User {
  id: string;
  email: string;
  token: string;
}

export enum Bandeira {
  BR = 'BR',
  IPIRANGA = 'IPIRANGA',
  SHELL = 'SHELL',
  ALE = 'ALE',
  VIBRA = 'VIBRA',
  RAIZEN = 'RAIZEN',
  OUTROS = 'OUTROS'
}

export enum FuelType {
  GASOLINA = 'GASOLINA',
  ETANOL = 'ETANOL',
  DIESEL_S10 = 'DIESEL S10',
  GASOLINA_ADITIVADA = 'GASOLINA ADITIVADA'
}

export interface GasStation {
  id: number;
  id_revenda: string;
  nome: string;
  produto: string;
  valor_venda: number;
  distancia: number;
  unidade_medida: string;
  latitude: number;
  longitude: number;
  bandeira: string;
  atualizado_em: string; // ISO string
}

export interface UserPreferences {
  bandeiraFavorita: Bandeira | 'TODAS';
  tipoCombustivel: FuelType;
  showOnlyFavorites: boolean;
}

export interface LocationState {
  latitude: number;
  longitude: number;
}