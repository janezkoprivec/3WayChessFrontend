import { useMemo } from 'react';
import { BoardOrientation, getBoardLabels } from '../utils/hexagonUtils';

interface BoardLabelsProps {
  size: number;
  boardOrientation?: BoardOrientation;
}

export function BoardLabels({ 
  size, 
  boardOrientation = 'white'
}: BoardLabelsProps) {
  const labelPositions = useMemo(() => {
    return getBoardLabels(size, boardOrientation);
  }, [size, boardOrientation]);

  return (
    <g id="board-labels">
      {labelPositions.letters.map((label, index) => (
        <text
          key={`letter-${index}`}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#333"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          {label.label}
        </text>
      ))}
      {labelPositions.numbers.map((label, index) => (
        <text
          key={`number-${index}`}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#333"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          {label.label}
        </text>
      ))}
    </g>
  );
} 