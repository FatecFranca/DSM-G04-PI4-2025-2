const PROD_URL = 'http://172.191.224.11:5000'; 
const DEV_URL = 'http://172.191.224.11:5000';

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_URL : PROD_URL,
  TIMEOUT: 10000,
};