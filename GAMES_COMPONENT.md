# Games Component

This document describes the new games functionality that allows users to view, create, and join online chess games.

## Components

### GamesComponent
The main component that displays available games and handles Socket.IO connections.

**Features:**
- Displays list of available games
- Real-time updates via Socket.IO
- Create new games
- Join existing games
- Navigate to offline games

**Socket Events:**
- `waiting-games`: Receives list of available games
- `game-created`: Handles newly created games
- `create`: Emits game creation request

### GameListItem
Displays individual game information in a card format.

**Shows:**
- Game name
- Status badge (waiting/active/finished)
- Creator information
- Time control settings
- Player count
- Assigned players (if any)

### GameJoinDialog
Modal dialog for joining games with color selection.

**Features:**
- Color selection (Random/White/Black)
- Game information display
- Join confirmation

### CreateGameDialog
Modal dialog for creating new games.

**Features:**
- Game name input
- Color preference selection
- Time control configuration
- Form validation

## Routes

### `/games`
Protected route that displays the games list page.

### `/game/:id`
Protected route for individual game pages (placeholder implementation).

## Types

### Game Interface
```typescript
interface Game {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  timeControl: TimeControl;
  status: 'waiting' | 'active' | 'finished';
  players: {
    white?: string;
    black?: string;
  };
  maxPlayers: number;
  currentPlayers: number;
}
```

### TimeControl Interface
```typescript
interface TimeControl {
  type: 'blitz' | 'rapid' | 'classical';
  initialTime: number;
  increment: number;
}
```

## Usage

1. Navigate to `/games` to view available games
2. Click on a game to join it
3. Use "New Online Game" button to create a new game
4. Use "New Offline Game" button to play offline

## Socket.IO Configuration

The component connects to the Socket.IO server using the base URL from the API configuration, removing the `/api` suffix and connecting to the `/games` namespace.

## Dependencies

- `socket.io-client`: For real-time communication
- `@mantine/core`: For UI components
- `@mantine/form`: For form handling
- `react-router-dom`: For navigation 