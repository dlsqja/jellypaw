import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPetList, getPetDetail, updatePetInfo, updatePetImage, deletePet, deletePetImage } from '../api/pet';
import type { CreatePetResponse, CreatePetRequest, getPetDetailResponse } from '../../types/main/pet';
import { petKeys } from './petKeys';

// LIST
export function usePetList() {
  return useQuery({
    queryKey: petKeys.list(),
    queryFn: getPetList,
  });
}

// DETAIL
export function usePetDetail(petId?: number) {
  return useQuery({
    queryKey: petId ? petKeys.detail(petId) : ['__noop'],
    queryFn: () => getPetDetail(petId as number),
    enabled: !!petId,
  });
}

// UPDATE INFO (JSON)
export function useUpdatePetInfo(petId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePetRequest) => updatePetInfo(petId, body),
    onSuccess: (serverData) => {
      // 상세 즉시 갱신
      qc.setQueryData<CreatePetResponse>(petKeys.detail(petId), serverData);
      // 목록 일부 필드도 변했을 수 있으니 가볍게 무효화
      qc.invalidateQueries({ queryKey: petKeys.list() });
    },
  });
}

// UPDATE IMAGE (multipart)
export function useUpdatePetImage(petId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoUri: string) => updatePetImage(petId, photoUri),
    onSuccess: (serverData) => {
      qc.setQueryData<CreatePetResponse>(petKeys.detail(petId), serverData);
      qc.invalidateQueries({ queryKey: petKeys.list() });
    },
  });
}

// DELETE
export function useDeletePet(petId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deletePet(petId),
    onSuccess: () => {
      // 상세/리스트 캐시 정리
      qc.removeQueries({ queryKey: petKeys.detail(petId) });
      qc.invalidateQueries({ queryKey: petKeys.list() });
    },
  });
}

export function useDeletePetImage(petId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deletePetImage(petId),
    onSuccess: (serverData) => {
      // 상세 캐시 갱신(photoUrl null 반영)
      qc.setQueryData<CreatePetResponse>(petKeys.detail(petId), serverData);
      // 목록 썸네일도 바뀔 수 있으니 무효화
      qc.invalidateQueries({ queryKey: petKeys.list() });
    },
  });
}