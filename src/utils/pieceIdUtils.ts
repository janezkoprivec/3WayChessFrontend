export interface PieceId {
  player: number;
  piece: number;
  q: number;
  r: number;
}

export function encodePieceId(player: number, piece: number, q: number, r: number): string {
  return `${player}|${piece}|${q}|${r}`;
}

export function decodePieceId(id: string): PieceId | null {
  try {
    const parts = id.split('|');
    if (parts.length !== 4) {
      return null;
    }
    
    return {
      player: parseInt(parts[0]),
      piece: parseInt(parts[1]),
      q: parseInt(parts[2]),
      r: parseInt(parts[3])
    };
  } catch (error) {
    console.error('Failed to decode piece ID:', id, error);
    return null;
  }
} 