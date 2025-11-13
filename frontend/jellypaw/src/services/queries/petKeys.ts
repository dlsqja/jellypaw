export const petKeys = {
  all: ['pets'] as const,
  list: () => [...petKeys.all, 'list'] as const,
  detail: (petId: number) => [...petKeys.all, 'detail', petId] as const,
};
