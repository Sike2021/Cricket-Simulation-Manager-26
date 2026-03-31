export function getPlayerAvatar(player: { id: string, name: string, avatarUrl?: string }): string {
  if (player.avatarUrl) return player.avatarUrl;
  
  // Deterministic seed based on player ID and name
  const seed = `${player.id}-${player.name.replace(/\s+/g, '-')}`.toLowerCase();
  
  // Using picsum.photos with a seed for "offline" (non-AI) consistent avatars
  // We use different categories based on the seed to get some variety
  return `https://picsum.photos/seed/${seed}/200/200`;
}
