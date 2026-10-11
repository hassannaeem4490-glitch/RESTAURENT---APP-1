// src/api/client.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your laptop's Wi-Fi IP address for testing on real phone (Expo Go)
const LAN_IP = '192.168.100.6';

export const BASE_URL = Platform.select({
  android: `http://${LAN_IP}:5000`,
  ios: `http://${LAN_IP}:5000`,
  web: 'http://localhost:5000',
  default: `http://${LAN_IP}:5000`,
});

console.log('[API Client] Active BASE_URL:', BASE_URL);

export const AUTH_STORAGE_KEY = '@restaurant_app/auth';

/**
 * Universal API Client helper
 * - Automatically injects Authorization: Bearer <token> from AsyncStorage
 * - Handles JSON serialization and parsing
 * - Throws descriptive Error with the server's message on 4xx/5xx responses
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Retrieve stored token if any
  let token = null;
  try {
    const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      token = parsed.token;
    }
  } catch (e) {
    // ignore storage reading error
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    console.error(`Network error reaching ${url}:`, networkError);
    throw new Error(
      `Cannot connect to server at ${BASE_URL}. Ensure server is running and check Wi-Fi/IP settings.`
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (parseError) {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status} (${response.statusText})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;