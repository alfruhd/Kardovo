import { SealShape } from '@/lib/schema';

/**
 * Returns SVG path data for a given procedural seal shape.
 * Normalized to a coordinate system of [0, 0, 100, 100].
 */
export function getSealShapePath(shape: SealShape, roughness: number = 35): string {
  // Center is (50, 50), radius is ~42
  switch (shape) {
    case 'round':
      return 'M 50,8 A 42,42 0 1,1 49.9,8 Z';

    case 'oval':
      return 'M 50,14 A 42,36 0 1,1 49.9,14 Z';

    case 'scalloped': {
      // 12 scalloped petals around the perimeter
      const points: string[] = [];
      const petals = 12;
      const rInner = 38;
      const rOuter = 44 + (roughness / 100) * 2;
      for (let i = 0; i < petals; i++) {
        const theta1 = (i / petals) * 2 * Math.PI;
        const thetaMid = ((i + 0.5) / petals) * 2 * Math.PI;
        const theta2 = ((i + 1) / petals) * 2 * Math.PI;

        const x1 = 50 + rInner * Math.cos(theta1);
        const y1 = 50 + rInner * Math.sin(theta1);
        const xc = 50 + rOuter * Math.cos(thetaMid);
        const yc = 50 + rOuter * Math.sin(thetaMid);
        const x2 = 50 + rInner * Math.cos(theta2);
        const y2 = 50 + rInner * Math.sin(theta2);

        if (i === 0) {
          points.push(`M ${x1.toFixed(2)},${y1.toFixed(2)}`);
        }
        points.push(`Q ${xc.toFixed(2)},${yc.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`);
      }
      points.push('Z');
      return points.join(' ');
    }

    case 'drip': {
      // Round seal with organic wax dripping blobs at the bottom
      return [
        'M 50,8',
        'C 73,8 92,27 92,50',
        'C 92,62 87,72 79,80',
        'C 75,84 72,94 67,95', // right drip
        'C 63,96 60,86 54,86',
        'C 51,86 48,96 43,96', // bottom central drip
        'C 38,96 36,83 31,81',
        'C 24,79 17,89 12,85', // left drip
        'C 8,82 8,62 8,50',
        'C 8,27 27,8 50,8',
        'Z',
      ].join(' ');
    }

    case 'star': {
      // Ornate 8-pointed royal star / rosette seal
      const points: string[] = [];
      const pointsCount = 16;
      for (let i = 0; i < pointsCount; i++) {
        const radius = i % 2 === 0 ? 45 : 36;
        const angle = (i / pointsCount) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        if (i === 0) {
          points.push(`M ${x.toFixed(2)},${y.toFixed(2)}`);
        } else {
          points.push(`L ${x.toFixed(2)},${y.toFixed(2)}`);
        }
      }
      points.push('Z');
      return points.join(' ');
    }

    case 'organic-rough':
    default: {
      // Natural molten wax puddle with slight organic asymmetry
      return [
        'M 50,7.5',
        'C 65,7 79,14 87,24',
        'C 94,33 93,48 91,60',
        'C 89,72 84,81 74,88',
        'C 64,95 49,94 37,90',
        'C 25,86 14,78 9,66',
        'C 5,54 7,40 13,29',
        'C 20,17 35,8 50,7.5',
        'Z',
      ].join(' ');
    }
  }
}
