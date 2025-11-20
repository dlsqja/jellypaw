// src/services/queries/authHooks.ts
import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { getAccessToken } from '../../lib/tokenStorage';
import { getUserIdFromToken } from '../../lib/apiClient';

export function useAuthUserId() {
  const [uid, setUid] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const read = async () => {
      
      const token = await getAccessToken();
      const id = getUserIdFromToken(token);
      console.log('[AUTH] uid=', id);

      if (mounted) setUid(id);
    };
    read();

    const sub = DeviceEventEmitter.addListener('AUTH_CHANGED', read); // ★ 추가
    return () => { mounted = false; sub.remove(); };
  }, []);

  return uid;
}

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const read = async () => {
      const t = await getAccessToken();
      if (mounted) setToken(t);
    };
    read();
    const sub = DeviceEventEmitter.addListener('AUTH_CHANGED', read);
    return () => { mounted = false; sub.remove(); };
  }, []);
  return token;
}

export function useAuthCacheKey() {
  const uid = useAuthUserId();
  const token = useAuthToken();
  return uid ?? (token ? `tok:${token.slice(0,16)}` : 'anon');
}
