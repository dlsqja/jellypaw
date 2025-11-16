// src/services/queries/petHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPetList, getPetDetail, updatePetInfo, updatePetImage, deletePet, deletePetImage } from '../api/pet';
import type { CreatePetResponse, CreatePetRequest } from '../../types/main/pet';
import { petKeys } from './petKeys';
import { useAuthCacheKey, useAuthToken } from './authHooks';
import { createPet } from '../api/pet';

export function usePetList() {
  const token = useAuthToken();
  const userKey = useAuthCacheKey();
  return useQuery({
    queryKey: petKeys.list(userKey),
    queryFn: getPetList,
    enabled: !!token,      // 로그인 상태면 호출
  });
}

export function usePetDetail(petId?: number) {
  const token = useAuthToken();
  const userKey = useAuthCacheKey();
  return useQuery({
    queryKey: petId ? petKeys.detail(userKey, petId) : ['__noop'],
    queryFn: () => getPetDetail(petId as number),
    enabled: !!token && !!petId,
  });
}

// 아래 mutation들 onSuccess에서 invalidate/setQueryData 키도 userKey로!
export function useUpdatePetInfo(petId: number) {
  const qc = useQueryClient();
  const userKey = useAuthCacheKey();
  return useMutation({
    mutationFn: (body: CreatePetRequest) => updatePetInfo(petId, body),
    onSuccess: (serverData) => {
      if (userKey) {
        qc.setQueryData<CreatePetResponse>(petKeys.detail(userKey, petId), serverData);
        qc.invalidateQueries({ queryKey: petKeys.list(userKey) });
      } else {
        qc.invalidateQueries({ queryKey: petKeys.all() });
      }
    },
  });
}

export function useUpdatePetImage(petId: number) {
  const qc = useQueryClient();
  const userKey = useAuthCacheKey();
  return useMutation({
    mutationFn: (photoUri: string) => updatePetImage(petId, photoUri),
    onSuccess: (serverData) => {
      if (userKey) {
        qc.setQueryData<CreatePetResponse>(petKeys.detail(userKey, petId), serverData);
        qc.invalidateQueries({ queryKey: petKeys.list(userKey) });
      } else {
        qc.invalidateQueries({ queryKey: petKeys.all() });
      }
    },
  });
}

export function useDeletePet(petId: number) {
  const qc = useQueryClient();
  const userKey = useAuthCacheKey();
  return useMutation({
    mutationFn: () => deletePet(petId),
    onSuccess: () => {
      if (userKey) {
        qc.removeQueries({ queryKey: petKeys.detail(userKey, petId) });
        qc.invalidateQueries({ queryKey: petKeys.list(userKey) });
      } else {
        qc.invalidateQueries({ queryKey: petKeys.all() });
      }
    },
  });
}

export function useDeletePetImage(petId: number) {
  const qc = useQueryClient();
  const userKey = useAuthCacheKey();
  return useMutation({
    mutationFn: () => deletePetImage(petId),
    onSuccess: (serverData) => {
      if (userKey) {
        qc.setQueryData<CreatePetResponse>(petKeys.detail(userKey, petId), serverData);
        qc.invalidateQueries({ queryKey: petKeys.list(userKey) });
      } else {
        qc.invalidateQueries({ queryKey: petKeys.all() });
      }
    },
  });
}

export function useCreatePet() {
  const qc = useQueryClient();
  const userKey = useAuthCacheKey();
  return useMutation({
    mutationFn: (body: CreatePetRequest & { photoUri?: string | null }) => createPet(body),
    onSuccess: (serverData) => {
      if (userKey) {
        if (serverData?.petId) {
          qc.setQueryData(petKeys.detail(userKey, serverData.petId), serverData);
        }
        qc.invalidateQueries({ queryKey: petKeys.list(userKey) });
      } else {
        qc.invalidateQueries({ queryKey: petKeys.all() });
      }
    },
  });
}
