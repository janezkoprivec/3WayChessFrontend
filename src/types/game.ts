export interface TimeControl {
  type: 'blitz' | 'rapid' | 'bullet';
  time: number;
  increment: number;
}

export interface Game {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  timeControl: TimeControl;
  status: 'waiting' | 'active' | 'finished';
  players: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
      profilePictureUrl?: string;
    };
    color: string;
  }>;
  maxPlayers?: number;
  currentPlayers?: number;
} 