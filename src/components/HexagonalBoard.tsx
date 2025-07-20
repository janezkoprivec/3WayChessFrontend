import { useMemo } from 'react';
import { createHex, Hex, transformCoordinates, BoardOrientation } from '../utils/hexagonUtils';
import { Hexagon } from './Hexagon';

export interface BoardDimensions {
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface HexagonalBoardProps {
  height: number; 
  showCoordinates?: boolean;
  boardOrientation?: BoardOrientation;
}

export function HexagonalBoard({ 
  height, 
  showCoordinates = false,
  boardOrientation = 'white'
}: HexagonalBoardProps) {
  const { hexagons, size } = useMemo(() => {
    const hexDict: Record<string, Hex> = {};
    
    for (let q = -4; q < 8; q++) {
      for (let r = -4; r < 4 - q; r++) {
        const s = -1 - q - r;
        hexDict[`${q}${r}`] = createHex(q, r, s);
      }
    }
    
    for (let q = -7; q < 4; q++) {
      for (let r = -4 - q; r < 4; r++) {
        const s = -1 - q - r;
        hexDict[`${q}${r}`] = createHex(q, r, s);
      }
    }
    
    const hexagons = Object.values(hexDict);

    const totalHexagonHeight = height - 40;
    const hexagonHeight = totalHexagonHeight / 12;
    const size = hexagonHeight / Math.sqrt(3);
    
    return {
      hexagons,
      size
    };
  }, [height]);

  return (
    <g id="board-layer">
      {hexagons.map((hex) => {
        const transformedCoords = transformCoordinates(hex.q, hex.r, hex.s, boardOrientation);
        
        return (
          <Hexagon
            key={`${hex.q}${hex.r}`}
            q={transformedCoords.q}
            r={transformedCoords.r}
            s={transformedCoords.s}
            size={size}
            showCoordinates={showCoordinates}
            fillColor={hex.getColor()}
            strokeColor="#000000"
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
} 