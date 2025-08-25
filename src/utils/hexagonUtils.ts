export interface Hex {
  q: number;
  r: number;
  s: number;
  getCoordinates(size: number): { x: number; y: number };
  getPoints(size: number): string;
  getColor(): string;
}

export type BoardOrientation = 'white' | 'black' | 'grey';

export function createHex(q: number, r: number, s: number): Hex {
  return {
    q,
    r,
    s,
    getCoordinates(size: number) {
      return hexToPixel(this.q, this.r, size);
    },
    getPoints(size: number) {
      const { x, y } = this.getCoordinates(size);
      return getHexPoints(x, y, size);
    },
    getColor() {
      return getHexColor(this.q, this.r);
    }
  };
}

export function getHexColor(q: number, r: number): string {

  const colorIndex = (2 * q + r) % 3;
  
  const normalizedIndex = ((colorIndex % 3) + 3) % 3;
  
  switch (normalizedIndex) {
    case 0:
      return '#E0E0E0'; 
    case 1:
      return '#A0A0A0'; 
    case 2:
      return '#606060'; 
    default:
      return '#E0E0E0';
  }
}

export function hexToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (3/2) * q + size / 2;
  const y = size * (-Math.sqrt(3)/2) * q + size * (-Math.sqrt(3)) * r + (-Math.sqrt(3) * size / 2);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number): { q: number; r: number } {
  const q = ((2/3) * (x - size/2)) / size;
  const r = ((-1/3) * (x - size/2) - (Math.sqrt(3)/3) * (y + Math.sqrt(3) * size / 2)) / size;
  return { q, r };
}

export function getHexPoints(centerX: number, centerY: number, size: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export function transformCoordinates(
  q: number, 
  r: number, 
  s: number, 
  orientation: BoardOrientation
): { q: number; r: number; s: number } {

  switch (orientation) {
    case 'white':
      return { q, r, s };
    case 'black':
      return { q: s, r: q, s: r };
    case 'grey':
      return { q: r, r: s, s: q };
    default:
      return { q, r, s };
  }
}

export function getChessNotation(q: number, r: number, orientation: BoardOrientation = 'white'): string {
  const transformed = transformCoordinates(q, r, -q - r, orientation);
  
  const letters = 'abcdefghijklmno';
  
  const letterIndex = transformed.q + 7;
  const number = -transformed.r + 8;
  
  if (letterIndex >= 0 && letterIndex < letters.length && number >= 1 && number <= 15) {
    return letters[letterIndex] + number;
  }
  
  return `${transformed.q},${transformed.r}`;
}

export function getBoardLabels(size: number, orientation: BoardOrientation = 'white'): {
  letters: Array<{ label: string; x: number; y: number }>;
  numbers: Array<{ label: string; x: number; y: number }>;
} {
  const letters: Array<{ label: string; x: number; y: number }> = [];
  const numbers: Array<{ label: string; x: number; y: number }> = [];
  
  const letterLabels = 'abcdefghijklmno';
  
  const letterCoords = [
    { q: -7, r: 2 }, { q: -6, r: 1 }, { q: -5, r: 0 }, { q: -4, r: -5 }, { q: -3, r: -5 },
    { q: -2, r: -5 }, { q: -1, r: -5 }, { q: 0, r: -5 }, { q: 1, r: -6 }, { q: 2, r: -7 },
    { q: 3, r: -8 }, { q: 4, r: -5 }, { q: 5, r: -5 }, { q: 6, r: -5 }, { q: 7, r: -5 }
  ];
  
  const numberCoords = [
    { q: 4, r: -7 }, { q: 4, r: -6 }, { q: 4, r: -5 }, { q: 8, r: -4 }, { q: 7, r: -3 },
    { q: 6, r: -2 }, { q: 5, r: -1 }, { q: 4, r: 0 }, { q: 4, r: 1 }, { q: 4, r: 2 },
    { q: 4, r: 3 }, { q: 0, r: 4 }, { q: -1, r: 5 }, { q: -2, r: 6 }, { q: -3, r: 7 }
  ];
  
  letterCoords.forEach((coord, index) => {
    if (index < letterLabels.length) {
      const transformedCoords = transformCoordinates(coord.q, coord.r, -coord.q - coord.r, orientation);
      const pixel = hexToPixel(transformedCoords.q, transformedCoords.r, size);
      
      letters.push({
        label: letterLabels[index],
        x: pixel.x,
        y: pixel.y - size * 0.3
      });
    }
  });
  
  numberCoords.forEach((coord, index) => {
    if (index < 15) {
      const transformedCoords = transformCoordinates(coord.q, coord.r, -coord.q - coord.r, orientation);
      const pixel = hexToPixel(transformedCoords.q, transformedCoords.r, size);
      
      numbers.push({
        label: (index + 1).toString(),
        x: pixel.x - size * 0.2,
        y: pixel.y + size * 0.3
      });
    }
  });
  
  return { letters, numbers };
} 