export const SOCKET_ROOMS = {
  user: (userId: string) => `user:${userId}`,

  conversation: (conversationId: string) => `conversation:${conversationId}`,

  debate: (debateId: string) => `debate:${debateId}`,

  presentation: (presentationId: string) => `presentation:${presentationId}`,
} as const;
