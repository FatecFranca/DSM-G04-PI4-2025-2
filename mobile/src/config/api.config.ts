const PROD_URL = 'http://192.168.100.8:5000/'; 
const DEV_URL = 'http://10.0.2.2:5000/';

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_URL : PROD_URL,
  TIMEOUT: 10000,
};