import axios from "axios";
/**
 * Instância centralizada do Axios.
 * A base URL é definida para facilitar as requisições à API.
 */
const apiClient = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Interceptor de resposta: extrai a mensagem de erro da API
 * e relança como um erro JavaScript padrão, facilitando o tratamento
 * nos componentes com mensagens amigáveis ao usuário.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error.response?.data?.mensagem ||
      error.response?.data?.title ||
      'Erro inesperado. Tente novamente.';
    return Promise.reject(new Error(mensagem));
  }
);

export default apiClient;