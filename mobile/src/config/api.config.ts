const PROD_URL = 'http://192.168.100.8:5000/'; 

// O IP de DESENVOLVIMENTO para o Emulador Android
// (10.0.2.2 é o 'apelido' para o localhost do seu PC)
const DEV_URL = 'http://10.0.2.2:5000/';

export const API_CONFIG = {
  // DEV é true quando você roda no seu PC
  // DEV é false quando você "builda" o app
  BASE_URL: __DEV__ ? DEV_URL : PROD_URL,

  TIMEOUT: 10000, // 10 segundos
};