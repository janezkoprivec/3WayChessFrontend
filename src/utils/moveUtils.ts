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
    console.log('Creating move from API data:', apiMove);
    
    const pieces = game.getPieces();
    console.log('Available pieces:', pieces.length);
    
    const fromPiece = pieces.find((piece: any) => 
      piece.coordinates.q === apiMove.from.q && 
      piece.coordinates.r === apiMove.from.r
    );

    if (!fromPiece) {
      console.error('No piece found at from coordinates:', apiMove.from);
      console.log('Available pieces coordinates:', pieces.map((p: any) => ({ q: p.coordinates.q, r: p.coordinates.r })));
      return null;
    }

    console.log('Found from piece:', fromPiece);
    
    const legalMoves = game.queryMoves(fromPiece.coordinates);
    console.log('Legal moves for piece:', legalMoves.length);
    
    const matchingMove = legalMoves.find((move: Move) => 
      move.to.q === apiMove.to.q && 
      move.to.r === apiMove.to.r && 
      move.move_type === apiMove.move_type &&
      move.color === apiMove.color &&
      move.piece === apiMove.piece
    );

    if (matchingMove) {
      console.log('Found matching move:', matchingMove);
      return matchingMove;
    } else {
      console.error('No matching legal move found');
      console.log('Looking for move with:', {
        to: apiMove.to,
        move_type: apiMove.move_type,
        color: apiMove.color,
        piece: apiMove.piece
      });
      console.log('Available legal moves:', legalMoves.map((m: Move) => ({
        to: { q: m.to.q, r: m.to.r },
        move_type: m.move_type,
        color: m.color,
        piece: m.piece
      })));
      return null;
    }
  } catch (error) {
    console.error('Failed to create move from API data:', error);
    return null;
  }
}
