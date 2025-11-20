export const petKeys = {
  all: (userKey?: string) => ['pets', userKey ?? 'anon'] as const,
  list: (userKey?: string) => [...petKeys.all(userKey), 'list'] as const,
  detail: (userKey: string | undefined, petId: number) =>
    [...petKeys.all(userKey), 'detail', petId] as const,
};
