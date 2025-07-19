import { useMemo } from 'react';
import { createHex, Hex } from '../utils/hexagonUtils';
import { Hexagon } from './Hexagon';

interface HexagonalBoardProps {
  height: number; 
  showCoordinates?: boolean;
}

export function HexagonalBoard({ 
  height, 
  showCoordinates = false 
}: HexagonalBoardProps) {
  const { hexagons, size, boardDimensions } = useMemo(() => {
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
    
    let minX = hexDict['-73'].getCoordinates(size).x, maxX = hexDict['7-4'].getCoordinates(size).x, minY = hexDict['-4-4'].getCoordinates(size).y, maxY = hexDict['-47'].getCoordinates(size).y;
    
    hexagons.forEach(hex => {
      const { x, y } = hex.getCoordinates(size);
      
      const hexRadius = size;
      minX = Math.min(minX, x - hexRadius);
      maxX = Math.max(maxX, x + hexRadius);
      minY = Math.min(minY, y - hexRadius);
      maxY = Math.max(maxY, y + hexRadius);
    });
    
    const boardWidth = maxX - minX + size * 2;
    const boardHeight = maxY - minY + size * 2;
    
    return {
      hexagons,
      size,
      boardDimensions: {
        width: boardWidth,
        height: boardHeight,
        minX: minX - size,
        maxX: maxX + size,
        minY: minY - size,
        maxY: maxY + size
      }
    };
  }, [height]);

  return (
    <svg
      width={boardDimensions.width}
      height={height}
      viewBox={`${boardDimensions.minX} ${boardDimensions.minY} ${boardDimensions.width} ${boardDimensions.height}`}
      style={{ 
        border: '1px solid #ccc',
        maxWidth: '100%',
        height: 'auto'
      }}
    >
      <g id="board-layer">
        {hexagons.map((hex) => (
          <Hexagon
            key={`${hex.q}${hex.r}`}
            q={hex.q}
            r={hex.r}
            s={hex.s}
            size={size}
            showCoordinates={showCoordinates}
            fillColor={hex.getColor()}
            strokeColor="#000000"
            strokeWidth={1}
          />
        ))}
      </g>
    </svg>
  );
} 