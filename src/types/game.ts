export interface TimeControl {
  type: 'blitz' | 'rapid' | 'bullet';
  time: number;
  increment: number;
}

export interface IUserLean {
  _id: string;
  email: string;
  username: string;
  profilePictureUrl: string;
}

export interface IGameLean {
  id: string;
  name: string;
  status: "active" | "waiting" | "finished";
  players: [{
    user: IUserLean;
    color: string;
  }];
  createdBy: IUserLean;
  timeControl: IGameTimeControl;
}

export interface IGameTimeControl {
  type: 'blitz' | 'rapid' | 'classical';
  initialTime: number;
  increment: number;
}

export interface Game {
  id: string;
  name: string;
  createdBy: IUserLean;
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