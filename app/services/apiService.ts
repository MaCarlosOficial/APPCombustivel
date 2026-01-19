import { GasStation, User } from '../types';

// ==============================================================================
// CONFIGURAÇÃO DAS APIs
// ==============================================================================

const API_URL_LOGIN = 'https://findfuelapi.onrender.com';
const API_URL_APP   = 'https://findfuelapi.onrender.com';

// ==============================================================================
// TIPOS AUXILIARES
// ==============================================================================

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: bigint;
    usuario: string;
    nome: string;
    email: string;
  };
}

// ==============================================================================
// SERVICE
// ==============================================================================

export const ApiService = {

  // ---------------------------------------------------------------------------
  // LOGIN (OAuth2)
  // ---------------------------------------------------------------------------
  login: async (emailOrUsername: string, password: string): Promise<User> => {
    // Para OAuth2 (password grant), geralmente usamos x-www-form-urlencoded
    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('username', emailOrUsername); // Aqui passamos o que foi digitado (e-mail ou user)
    body.append('password', password);

    const response = await fetch(`${API_URL_LOGIN}/login/auth/login`, {
      method: 'POST',
      headers: {
        // CORREÇÃO: O header deve condizer com o corpo enviado
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: body.toString() // Converta para string
    });

    if (!response.ok) {
      // Tente pegar o erro detalhado do backend se houver
      const errorDetail = await response.json().catch(() => ({}));
      throw new Error(errorDetail.detail || 'E-mail/Usuário ou senha inválidos');
    }

    const data: LoginResponse = await response.json();
    const token = data.access_token;
    const usuario = data.user;

    //console.log('[ApiService] Token recebido:', token);

    if (!token) {
      console.error('[ApiService] Erro: Token não encontrado na resposta do servidor!');
      throw new Error('Erro na autenticação: Servidor não enviou o token.');
    }

    return {
      token: token,
      userID: usuario.id, // Ou extraia o ID do token/backend se disponível
      userLogin : usuario.usuario,
      userName : usuario.nome,
      email: usuario.email
      };
  },

  // ---------------------------------------------------------------------------
  // CONSULTA DE COMBUSTÍVEL (ROTA PROTEGIDA)
  // ---------------------------------------------------------------------------
  getStationsNear: async (
    token: string,
    latitude = -23.55052,
    longitude = -46.633308,
    raioKm = 5.0
  ): Promise<GasStation[]> => {
  try {
    const url = new URL(`${API_URL_APP}/findFuel/fuel/prices`);

    console.log(`[ApiService] Chamando: ${url} Lat: ${latitude.toString()} Lon: ${longitude.toString()} Raio: ${raioKm} km`);

    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('raio_km', raioKm.toString());

    console.log('TOKEN:', token);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao consultar preços');
    }

    const data = await response.json();

    console.log(`[ApiService] Dados recebidos (${data.length} postos):`);

    return data.map((item: any) => ({
      id: `${item.id_revenda || Math.random()}-${item.produto}`,
      id_revenda: String(item.id_revenda || 'unknown'),
      nome: item.nome,
      produto: item.produto,
      valor_venda: item.valor_venda,
      distancia: item.distancia,
      unidade_medida: item.unidade_medida,
      latitude: item.latitude,
      longitude: item.longitude,
      bandeira: item.bandeira,
      atualizado_em: item.atualizado_em
    }));

  } catch (error) {
    console.error('Erro na API de combustíveis:', error);
    return [];
  }
},

  // ---------------------------------------------------------------------------
  // cria usuário
  // ---------------------------------------------------------------------------
  register: async (email: string, password: string): Promise<User> => {
    // Derivamos 'usuario' e 'nome' do e-mail para preencher os campos obrigatórios do backend
    const username = email.split('@')[0];
    
    const payload = {
      usuario: username,
      nome: username,
      email: email,
      senha: password
    };

    const response = await fetch(`${API_URL_LOGIN}/login/usuarios/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao criar conta');
    }

    await response.json();
    
    // Após registrar com sucesso, fazemos o login para obter o token real
    return ApiService.login(email, password);
  },

  // ---------------------------------------------------------------------------
  // Atualiza perfil do usuário
  // ---------------------------------------------------------------------------
  updateProfile: async (
    token: string,
    userID: string,
    data: {
      nome: string;
      usuario: string;
      email: string;
      senha: string;
    },
  ) => {
    const response = await fetch(
      `http://127.0.0.1:5000/login/usuarios/${userID}`,
      {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erro ao atualizar usuário");
    }

    return response.json();
  }
};
// ==============================================================================