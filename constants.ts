import type { Point3D, Rotation3D } from './types';

export const TARGET_ROTATION: Rotation3D = { x: Math.atan(1 / Math.sqrt(2)), y: Math.PI / 4, z: 0 };

// This map translates the internal edge index to the visible number in the guide, matching the user's reference image.
export const EDGE_NUMBER_MAP: number[] = [11, 7, 6, 5, 3, 2, 8, 10, 4, 9, 1, 12];

export const ALPHABET_LOGOS: Record<string, number[]> = {
    ' ': [], // Explicitly define space as having no edges
    'A': [3, 2, 10, 5], 'B': [1, 10, 6, 9, 4, 7], 'C': [10, 2, 3, 8, 4], 'D': [1, 10, 5, 4, 7],
    'E': [2, 11, 0, 8], 'F': [10, 1, 9, 7], 'G': [10, 2, 3, 8, 4, 9], 'H': [3, 5],
    'I': [1, 7], 'J': [1, 7, 8], 'K': [1, 7, 6, 9], 'L': [1, 7, 4], 'M': [3, 11, 6, 5],
    'N': [3, 11, 9, 5], 'O': [10, 5, 4, 8, 3, 2], 'P': [7, 1, 10, 6], 'Q': [10, 5, 4, 8, 3, 2, 9], 
    'R': [7, 1, 10, 6, 9], 'S': [2, 11, 0], 'T': [2, 10, 1, 7], 'U': [3, 8, 4, 5], 
    'V': [11, 9, 5], 'W': [3, 0, 9, 5], 'X': [11, 9, 0, 6], 'Y': [11, 6, 7], 'Z': [10, 6, 0, 8],
    '*': [1, 6, 9, 7, 0, 11],
};

export const NUMBERS_LOGOS: Record<string, number[]> = {
    '0': [10, 5, 4, 8, 3, 2], 
    '1': [2, 1, 7], 
    '2': [2, 10, 6, 0, 8, 4],
    '3': [10, 6, 9, 4], 
    '4': [3, 0, 1, 7], 
    '5': [10, 2, 11, 9, 4, 8],
    '6': [10, 2, 3, 8, 4, 9, 0], 
    '7': [2, 10, 6, 7], 
    '8': [2, 10, 11, 6, 0, 9, 8, 4],
    '9': [6, 11, 2, 10, 5, 4, 8]
};

const S = 50;
export const CUBE_VERTICES_3D: Point3D[] = [
    { x: -S, y: -S, z: -S }, { x: S, y: -S, z: -S }, { x: S, y: S, z: -S }, { x: -S, y: S, z: -S },
    { x: -S, y: -S, z: S },  { x: S, y: -S, z: S },  { x: S, y: S, z: S },  { x: -S, y: S, z: S }
];

export const CUBE_EDGES: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
];