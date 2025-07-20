import { ChessPiece } from './ChessPiece';
import { ChessPiece as GamePiece } from '../../web/tri-hex-chess';
import { transformCoordinates, BoardOrientation } from '../utils/hexagonUtils';
import { encodePieceId } from '../utils/pieceIdUtils';

export interface Move {
  pieceId: string;
  fromQ: number;
  fromR: number;
  toQ: number;
  toR: number;
}

interface PiecesLayerProps {
  pieces: GamePiece[];
  size: number; 
  boardOrientation?: BoardOrientation;
}

export function PiecesLayer({ 
  pieces, 
  size, 
  boardOrientation = 'white'
}: PiecesLayerProps) {

  const getPieceId = (piece: GamePiece): string => {
    return encodePieceId(piece.player, piece.piece, piece.coordinates.q, piece.coordinates.r);
  };

  return (
    <g id="pieces-layer">
      {pieces.map((piece, index) => {
        const pieceId = getPieceId(piece);
        const transformedCoords = transformCoordinates(
          piece.coordinates.q, 
          piece.coordinates.r, 
          piece.coordinates.s, 
          boardOrientation
        );
        
        return (
          <ChessPiece
            key={`${pieceId}-${index}`}
            piece={piece.piece}
            color={piece.player}
            q={transformedCoords.q}
            r={transformedCoords.r}
            size={size}
            boardOrientation={boardOrientation}
          />
        );
      })}
    </g>
  );
} 