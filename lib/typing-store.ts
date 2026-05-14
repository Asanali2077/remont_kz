// Ephemeral typing state: requestId → Map<userId, expiresAt (ms)>
// Cleared after 4 seconds of no update per user
export const typingStore = new Map<string, Map<string, number>>();
