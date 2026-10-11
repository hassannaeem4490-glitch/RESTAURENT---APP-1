// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Custom hook to execute API calls with loading, error, and refetch management.
 * @param {string|Function} endpointOrFn - Endpoint string (e.g. '/api/menu') or async function
 * @param {object} options - Initial options or dependencies
 */
export default function useApi(endpointOrFn, options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (typeof endpointOrFn === 'function') {
        result = await endpointOrFn();
      } else {
        result = await apiClient(endpointOrFn, options);
      }
      setData(result);
      return result;
    } catch (err) {
      console.error('useApi fetch error:', err.message);
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpointOrFn]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await fetchData();
      } catch (e) {
        // handled in state
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}
