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
      return getHexColor(this.q, this.r, this.s);
    }
  };
}

export function getHexColor(q: number, r: number, s: number): string {

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