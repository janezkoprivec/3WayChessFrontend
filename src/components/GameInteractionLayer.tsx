import { useCallback, useMemo, useState } from 'react';
import { ChessPiece as GamePiece, Game, Color, Move } from '../../web/tri-hex-chess';
import { hexToPixel, transformCoordinates, BoardOrientation } from '../utils/hexagonUtils';
import { encodePieceId } from '../utils/pieceIdUtils';

interface GameInteractionLayerProps {
  game: Game | null;
  pieces: GamePiece[];
  size: number;
  onPieceSelect?: (piece: GamePiece | null) => void;
  onMoveSelect?: (move: Move) => void;
  boardOrientation?: BoardOrientation;
  currentTurn: Color;
  isMyTurn: boolean;
}

export function GameInteractionLayer({
  game,
  pieces,
  size,
  onPieceSelect,
  onMoveSelect,
  boardOrientation = 'white',
  currentTurn,
  isMyTurn
}: GameInteractionLayerProps) {

  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);

  const legalMoves = useMemo(() => {
    if (!game || !selectedPiece) return [];

    console.log('selected piece CHANGED')

    return game.queryMoves(selectedPiece.coordinates);
  }, [selectedPiece]);

  const selectedPieceId = useMemo(() => {
    return selectedPiece ? encodePieceId(selectedPiece.player, selectedPiece.piece, selectedPiece.coordinates.q, selectedPiece.coordinates.r) : null;
  }, [selectedPiece]);

  const handlePieceClick = useCallback((piece: GamePiece | null) => {
    if (!game || !piece || !isMyTurn) return;
    
    const pieceId = encodePieceId(piece.player, piece.piece, piece.coordinates.q, piece.coordinates.r);

    if (piece.player !== currentTurn) {
      return;
    }
    
    if (selectedPieceId === pieceId) {
      setSelectedPiece(null);
      onPieceSelect?.(null);
    } else {
      setSelectedPiece(piece);
      onPieceSelect?.(piece);
    }
  }, [game, selectedPieceId, currentTurn, onPieceSelect, isMyTurn]);

  const handleMoveClick = useCallback((move: Move) => {
    if (!isMyTurn) return;
    setSelectedPiece(null);
    onMoveSelect?.(move);
  }, [onMoveSelect, isMyTurn]);

  const getPieceId = (piece: GamePiece): string => {
    return encodePieceId(piece.player, piece.piece, piece.coordinates.q, piece.coordinates.r);
  };

  const isPieceClickable = (piece: GamePiece): boolean => {
    return piece.player === currentTurn && isMyTurn;
  };

  return (
    <g id="game-interaction-layer">
      {pieces.map((piece, index) => {
        const pieceId = getPieceId(piece);
        const isClickable = isPieceClickable(piece);
        const transformedCoords = transformCoordinates(
          piece.coordinates.q,
          piece.coordinates.r,
          piece.coordinates.s,
          boardOrientation
        );
        
        const { x, y } = hexToPixel(transformedCoords.q, transformedCoords.r, size);
        const clickRadius = size * 0.6;
        
        return (
          <circle
            key={`interactive-piece-${pieceId}-${index}`}
            cx={x}
            cy={y}
            r={clickRadius}
            fill={ 'transparent'}
            stroke="none"
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            pointerEvents={isClickable ? 'auto' : 'none'}
            onClick={() => isClickable && handlePieceClick(piece)}
          />
        );
      })}
      
      {legalMoves.map((move, index) => {
        const transformedCoords = transformCoordinates(
          move.to.q,
          move.to.r,
          move.to.s,
          boardOrientation
        );
        
        const { x, y } = hexToPixel(transformedCoords.q, transformedCoords.r, size);
        
        const isCapture = move.move_type === 2 || move.move_type === 6;
        const clickRadius = size * 0.6;
        const visualRadius = isCapture ? size * 0.5 : size * 0.15;
        
        return (
          <g key={`interactive-move-${index}`}>
            <circle
              cx={x}
              cy={y}
              r={clickRadius}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => handleMoveClick(move)}
            />
            <circle
              cx={x}
              cy={y}
              r={visualRadius}
              fill={isCapture ? 'transparent' : '#4CAF50'}
              stroke={isCapture ? '#FF4444' : 'none'}
              strokeWidth={isCapture ? 3 : 0}
              opacity={0.8}
              pointerEvents="none"
            />
          </g>
        );
      })}
    </g>
  );
} 