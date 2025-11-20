// src/lib/logout.ts
import { clearTokens } from './tokenStorage';
import { queryClient } from './queryClient'; 

export async function hardLogout() {
  await clearTokens();
  queryClient.clear();   
}
