import { Move } from '../../web/tri-hex-chess';

export interface ApiMove {
  from: {
    i: number;
    q: number;
    r: number;
    s: number;
  };
  to: {
    i: number;
    q: number;
    r: number;
    s: number;
  };
  _id: string;
  moveNumber: number;
  move_type: number;
  color: number;
  piece: number;
  timestamp: string;
}

export function createMoveFromApiData(apiMove: ApiMove, game: any): Move | null {
  try {    
    const pieces = game.getPieces();
    
    const fromPiece = pieces.find((piece: any) => 
      piece.coordinates.q === apiMove.from.q && 
      piece.coordinates.r === apiMove.from.r
    );

    if (!fromPiece) {
      console.error('No piece found at from coordinates:', apiMove.from);
      return null;
    }

    
    const legalMoves = game.queryMoves(fromPiece.coordinates);
    
    const matchingMove = legalMoves.find((move: Move) => 
      move.to.q === apiMove.to.q && 
      move.to.r === apiMove.to.r && 
      move.move_type === apiMove.move_type &&
      move.color === apiMove.color &&
      move.piece === apiMove.piece
    );

    if (matchingMove) {
      return matchingMove;
    } else {
      console.error('No matching legal move found');
      return null;
    }
  } catch (error) {
    console.error('Failed to create move from API data:', error);
    return null;
  }
}
