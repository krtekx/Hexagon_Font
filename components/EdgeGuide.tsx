import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Point3D, Point2D, Rotation3D } from '../types';
import { CUBE_VERTICES_3D, CUBE_EDGES, TARGET_ROTATION, EDGE_NUMBER_MAP } from '../constants';

interface EdgeGuideProps {
    isVisible: boolean;
    onClose: () => void;
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

const EdgeGuide: React.FC<EdgeGuideProps> = ({ isVisible, onClose }) => {
    const [rotation, setRotation] = useState<Rotation3D>(TARGET_ROTATION);
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef<{ x: number; y: number } | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);


    useEffect(() => {
        // Cleanup animation frame and timeout on unmount
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    
    const vertices2D = useMemo(() => CUBE_VERTICES_3D.map(v => rotate(v, rotation)), [rotation]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        // Stop any return animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        // Stop any scheduled return
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !lastMousePos.current) return;
        e.preventDefault();
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        setRotation(prev => ({
            ...prev,
            y: prev.y + dx * 0.01,
            x: prev.x - dy * 0.01,
        }));

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, [isDragging]);

    const handleMouseUpOrLeave = useCallback(() => {
        if (!isDragging) return;

        setIsDragging(false);
        lastMousePos.current = null;
        
        // Schedule the return animation after a 2-second delay
        timeoutRef.current = window.setTimeout(() => {
            const startRotation = rotation;
            const startTime = performance.now();
            const duration = 600; // ms

            const animateReturn = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

                const nextRotation = {
                    x: startRotation.x + (TARGET_ROTATION.x - startRotation.x) * easedProgress,
                    y: startRotation.y + (TARGET_ROTATION.y - startRotation.y) * easedProgress,
                    z: startRotation.z + (TARGET_ROTATION.z - startRotation.z) * easedProgress,
                };

                setRotation(nextRotation);

                if (progress < 1) {
                    animationFrameRef.current = requestAnimationFrame(animateReturn);
                } else {
                    setRotation(TARGET_ROTATION); // Snap to final position to avoid precision errors
                    animationFrameRef.current = null;
                }
            };

            animationFrameRef.current = requestAnimationFrame(animateReturn);
        }, 2000); // 2-second delay

    }, [isDragging, rotation]);

    if (!isVisible) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
        >
            <div 
                className="bg-gray-800 p-6 rounded-lg max-w-sm w-full relative select-none"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
                >
                    &times;
                </button>
                <h2 className="text-xl font-bold text-center mb-4 text-blue-400">Edge Numbering Guide</h2>
                <div className="flex justify-center">
                    <svg 
                        viewBox="-100 -100 200 200" 
                        width="250" 
                        height="250"
                        onMouseDown={handleMouseDown}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    >
                        <g>
                            {/* Edges */}
                            {CUBE_EDGES.map((edge, index) => {
                                const v1 = vertices2D[edge[0]];
                                const v2 = vertices2D[edge[1]];
                                return (
                                    <g key={`guide-edge-${index}`}>
                                        <line 
                                            x1={v1.x} y1={v1.y} 
                                            x2={v2.x} y2={v2.y} 
                                            stroke="#FFFFFF" 
                                            strokeOpacity="0.5" 
                                            strokeWidth="1.5" 
                                        />
                                        <text
                                            x={(v1.x + v2.x) / 2}
                                            y={(v1.y + v2.y) / 2}
                                            fill="#FFAA00"
                                            fontSize="10"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: '3px' }}
                                        >
                                            {EDGE_NUMBER_MAP[index]}
                                        </text>
                                    </g>
                                );
                            })}
                            
                            {/* Vertices */}
                            {vertices2D.map((v, index) => (
                                <g key={`guide-vertex-${index}`}>
                                    <circle cx={v.x} cy={v.y} r="3" fill="#4299E1" />
                                     <text
                                        x={v.x + 5}
                                        y={v.y - 5}
                                        fill="#63B3ED"
                                        fontSize="8"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: '2px' }}
                                    >
                                        {index}
                                    </text>
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>
                <p className="text-xs text-center text-gray-400 mt-4">
                    Click and drag the cube to rotate.
                </p>
            </div>
        </div>
    );
};

export default EdgeGuide;