import { useCallback } from 'react';
import { ChessPiece } from './ChessPiece';
import { ChessPiece as GamePiece } from '../../web/tri-hex-chess';
import { hexToPixel } from '../utils/hexagonUtils';

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
  onPieceMove?: (move: Move) => void;
  onPieceClick?: (piece: GamePiece) => void;
  selectedPieceId?: string;
}

export function PiecesLayer({ 
  pieces, 
  size, 
  onPieceMove, 
  onPieceClick,
  selectedPieceId 
}: PiecesLayerProps) {
  const handlePieceClick = useCallback((piece: GamePiece) => {
    if (onPieceClick) {
      onPieceClick(piece);
    }
  }, [onPieceClick]);

  const getPieceId = (piece: GamePiece): string => {
    return `${piece.player}-${piece.piece}-${piece.coordinates.q}-${piece.coordinates.r}`;
  };

  return (
    <g id="pieces-layer">
      {pieces.map((piece, index) => {
        const pieceId = getPieceId(piece);
        return (
          <ChessPiece
            key={`${pieceId}-${index}`}
            piece={piece.piece}
            color={piece.player}
            q={piece.coordinates.q}
            r={piece.coordinates.r}
            size={size}
            onClick={() => handlePieceClick(piece)}
          />
        );
      })}
      
      {selectedPieceId && (
        (() => {
          const selectedPiece = pieces.find(p => getPieceId(p) === selectedPieceId);
          if (!selectedPiece) return null;
          
          const { x, y } = hexToPixel(
            selectedPiece.coordinates.q, 
            selectedPiece.coordinates.r, 
            size
          );
          
          return (
            <circle
              cx={x}
              cy={y}
              r={size * 0.4}
              fill="none"
              stroke="#FFD700"
              strokeWidth="3"
              strokeDasharray="5,5"
              pointerEvents="none"
            />
          );
        })()
      )}
    </g>
  );
} 