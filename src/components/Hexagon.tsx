import { useMemo } from 'react';
import { createHex } from '../utils/hexagonUtils';

interface HexagonProps {
  q: number;
  r: number;
  s: number;
  size: number;
  showCoordinates?: boolean;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export function Hexagon({ 
  q, 
  r, 
  s, 
  size, 
  showCoordinates = false, 
  fillColor, 
  strokeColor, 
  strokeWidth = 1 
}: HexagonProps) {
  const { x, y, points } = useMemo(() => {
    const hex = createHex(q, r, s);
    const { x, y } = hex.getCoordinates(size);
    const points = hex.getPoints(size);
    
    return { x, y, points };
  }, [q, r, s, size]);

  return (
    <g>
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {showCoordinates && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="#000"
          fontWeight="bold"
        >
          {q},{r}
        </text>
      )}
    </g>
  );
} 