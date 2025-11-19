import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { RenderParams, Rotation3D, Point3D, Point2D } from '../types';
import {
    ALPHABET_LOGOS,
    NUMBERS_LOGOS,
    TARGET_ROTATION,
    CUBE_VERTICES_3D,
    CUBE_EDGES
} from '../constants';

interface CharacterGridProps {
    text: string;
    params: RenderParams;
}

const rotate = (p: Point3D, rot: Rotation3D): Point2D => {
    let { x, y, z } = p;
    const cosY = Math.cos(rot.y), sinY = Math.sin(rot.y);
    let x1 = x * cosY + z * sinY;
    let z1 = -x * sinY + z * cosY;
    const cosX = Math.cos(rot.x), sinX = Math.sin(rot.x);
    let y2 = y * cosX - z1 * sinX;
    return { x: x1, y: -y2 };
};

const CharacterGrid: React.FC<CharacterGridProps> = ({ text, params }) => {
    const displayRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const element = displayRef.current;
        if (!element) return;
        
        setContainerWidth(element.clientWidth);

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });

        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
    }, []);

    const gridLayout = useMemo(() => {
        if (containerWidth === 0) return { characters: [], svgHeight: 0 };
        
        const hexWidth = Math.sqrt(3) * params.hexagonSize;
        const hexHeight = 2 * params.hexagonSize;
        const gap = 0; // Grid has no gap, hexagons touch
        
        let cols = Math.floor((containerWidth - hexWidth / 4) / (hexWidth + gap));
        if (cols <= 0) cols = 1;

        const characters = [];
        let currentRow = 0;
        let currentCol = 0;
        const processedText = text.toUpperCase();

        for (let i = 0; i < processedText.length; i++) {
            const char = processedText[i];

            if (char === '\n') {
                currentRow++;
                currentCol = 0;
                continue; // Do not render the newline character
            }

            if (currentCol >= cols) {
                currentRow++;
                currentCol = 0;
            }

            const xOffset = (currentRow % 2) * (hexWidth + gap) / 2;
            const x = currentCol * (hexWidth + gap) + xOffset + hexWidth / 2;
            const y = currentRow * (hexHeight * 0.75 + gap) + hexHeight / 2;
            
            characters.push({ char, x, y, key: `${char}-${i}` });
            currentCol++;
        }

        const totalRows = characters.length > 0 ? currentRow + 1 : 0;
        const svgHeight = totalRows * (hexHeight * 0.75 + gap) + hexHeight * 0.25;

        return { characters, svgHeight };

    }, [text, params.hexagonSize, containerWidth]);

    return (
        <div id="character-display-area" ref={displayRef} className="w-full p-4 bg-black rounded-lg min-h-[300px]">
            {gridLayout.svgHeight > 0 && (
                <svg width="100%" height={gridLayout.svgHeight} xmlns="http://www.w3.org/2000/svg">
                    <style>{`
                        .hexagon-cell:hover .hexagon-bg {
                            fill: #374151;
                        }
                        .flicker-line {
                            animation-name: flicker;
                            animation-timing-function: ease-in-out;
                            animation-iteration-count: infinite;
                        }
                        @keyframes flicker {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.2; }
                        }
                    `}</style>

                    {gridLayout.characters.map(({ char, x, y, key }) => (
                        <HexagonCharacter key={key} char={char} params={params} x={x} y={y} />
                    ))}
                </svg>
            )}
        </div>
    );
};


interface HexagonCharacterProps {
    char: string;
    params: RenderParams;
    x: number;
    y: number;
}

const HexagonCharacter: React.FC<HexagonCharacterProps> = ({ char, params, x, y }) => {
    
    const charData = useMemo(() => {
        let currentLogos: Record<string, number[]>;
        const isNumber = !isNaN(parseInt(char));

        if (isNumber) {
            currentLogos = NUMBERS_LOGOS;
        } else {
            currentLogos = ALPHABET_LOGOS;
        }
        
        const logoIndices = currentLogos[char] || [];
        const vertices2D = CUBE_VERTICES_3D.map(v => rotate(v, TARGET_ROTATION));
        
        const characterVertexIndices = new Set<number>();
        logoIndices.forEach(index => {
            characterVertexIndices.add(CUBE_EDGES[index][0]);
            characterVertexIndices.add(CUBE_EDGES[index][1]);
        });

        return { vertices2D, logoIndices, characterVertexIndices };

    }, [char]);

    const flickerIndices = useMemo(() => {
        const indices = new Set<number>();
        if (params.flickerSpeed > 0 && params.flickerAmount > 0 && charData.logoIndices.length > 0) {
            const numToFlicker = Math.ceil(charData.logoIndices.length * (params.flickerAmount / 100));
            const shuffled = [...charData.logoIndices].sort(() => 0.5 - Math.random());
            for(let i = 0; i < numToFlicker; i++) {
                indices.add(shuffled[i]);
            }
        }
        return indices;
    }, [charData.logoIndices, params.flickerSpeed, params.flickerAmount]);

    const hexagonPoints = useMemo(() => {
        let points = '';
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i + 30);
            points += `${params.hexagonSize * Math.cos(angle)},${params.hexagonSize * Math.sin(angle)} `;
        }
        return points.trim();
    }, [params.hexagonSize]);
    
    // Gap now affects the font scale inside the hexagon, not the hexagon's position.
    const fontScale = Math.max(0, (params.hexagonSize - params.hexagonGap) / 100);

    return (
        <g className="hexagon-cell" transform={`translate(${x}, ${y})`}>
            {/* Background Grid Hexagon */}
            {params.gridStrokeWidth > 0 && (
                <polygon
                    points={hexagonPoints}
                    fill="none"
                    stroke={params.gridColor}
                    strokeWidth={params.gridStrokeWidth}
                    strokeOpacity={params.gridOpacity}
                />
            )}
            
            {/* Invisible polygon for hover effects */}
            <polygon className="hexagon-bg" points={hexagonPoints} fill="transparent" stroke="none" />
            
            <g transform={`scale(${fontScale})`}>
                {/* Background Skeleton */}
                {params.thinStroke > 0 && CUBE_EDGES.map((edge, index) => {
                    const v1 = charData.vertices2D[edge[0]];
                    const v2 = charData.vertices2D[edge[1]];
                    return <line key={`bg-edge-${index}`} x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} stroke={params.thinColor} strokeOpacity={params.thinOpacity} strokeWidth={params.thinStroke} />
                })}

                {/* Skeleton Vertices */}
                {params.vertexSize > 0 && charData.vertices2D.map((v, index) => {
                    const r = params.vertexSize / 2;
                    return r > 0 && <circle key={`bg-vert-${index}`} cx={v.x} cy={v.y} r={r} fill={params.vertexColor} fillOpacity={params.thinOpacity} />
                })}

                {/* Foreground Character */}
                {params.thickStroke > 0 && charData.logoIndices.map((edgeIndex, i) => {
                    const edge = CUBE_EDGES[edgeIndex];
                    const v1 = charData.vertices2D[edge[0]];
                    const v2 = charData.vertices2D[edge[1]];
                    const isFlickering = flickerIndices.has(edgeIndex);
                    return <line 
                        key={`fg-edge-${i}`} 
                        className={isFlickering ? 'flicker-line' : ''}
                        style={isFlickering ? { animationDuration: `${(2 / params.flickerSpeed).toFixed(2)}s`, animationDelay: `${Math.random().toFixed(2)}s`} : {}}
                        x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} 
                        stroke={params.thickColor} strokeWidth={params.thickStroke} strokeLinecap="round" />
                })}

                {/* Character vertices */}
                {params.thickStroke > 0 && Array.from(charData.characterVertexIndices).map((vertexIndex, i) => {
                    const v = charData.vertices2D[vertexIndex];
                    const r = params.thickStroke / 2;
                    return r > 0 && <circle key={`fg-vert-${i}`} cx={v.x} cy={v.y} r={r} fill={params.thickColor} />
                })}
            </g>
        </g>
    );
};


export default React.memo(CharacterGrid);
