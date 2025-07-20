import { useMemo } from 'react';
import { hexToPixel } from '../utils/hexagonUtils';
import { Piece, Color } from '../../web/tri-hex-chess';

type BoardOrientation = 'white' | 'black' | 'grey';

interface ChessPieceProps {
  piece: Piece;
  color: Color;
  q: number;
  r: number;
  size: number; 
  boardOrientation?: BoardOrientation;
}

export function ChessPiece({ 
  piece, 
  color, 
  q, 
  r, 
  size, 
  boardOrientation = 'white'
}: ChessPieceProps) {

  const getColorName = (color: Color): string => {
    switch (color) {
      case Color.White: return 'white';
      case Color.Gray: return 'grey';
      case Color.Black: return 'black';
      default: return 'white';
    }
  };

  const getPieceName = (piece: Piece): string => {
    switch (piece) {
      case Piece.Pawn: return 'pawn';
      case Piece.Knight: return 'knight';
      case Piece.Bishop: return 'bishop';
      case Piece.Rook: return 'rook';
      case Piece.Queen: return 'queen';
      case Piece.King: return 'king';
      default: return 'pawn';
    }
  };

  const { x, y, pieceSize, iconPath } = useMemo(() => {
    const { x, y } = hexToPixel(q, r, size);
    const pieceSize = size * 1.1; 
    
    const colorName = getColorName(color);
    const pieceName = getPieceName(piece);
    const iconPath = `/pieces/${colorName}/${colorName}-${pieceName}.svg`;
    
    return { x, y, pieceSize, iconPath };
  }, [q, r, size, piece, color, boardOrientation]);

  return (
    <g>
      <image
        x={x - pieceSize / 2}
        y={y - pieceSize / 2}
        width={pieceSize}
        height={pieceSize}
        href={iconPath}
      />
    </g>
  );
} 