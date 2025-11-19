import React, { useState, useCallback } from 'react';
import type { RenderParams } from './types';
import ControlsPanel from './components/ControlsPanel';
import CharacterGrid from './components/CharacterGrid';
import EdgeGuide from './components/EdgeGuide';

const App: React.FC = () => {
    const [text, setText] = useState<string>('HEXAGON FONT');
    const [params, setParams] = useState<RenderParams>({
        hexagonSize: 80,
        hexagonGap: 5,
        thinStroke: 1,
        thickStroke: 4,
        vertexSize: 1,
        thinOpacity: 0.1,
        thickColor: '#FFFFFF',
        thinColor: '#FFFFFF',
        vertexColor: '#FFFFFF',
        flickerSpeed: 0,
        flickerAmount: 25,
        gridColor: '#4A5568',
        gridStrokeWidth: 1,
        gridOpacity: 0.2,
    });
    const [isGuideVisible, setIsGuideVisible] = useState(false);
    const [includeBgInExport, setIncludeBgInExport] = useState(true);

    const handleParamChange = useCallback(<K extends keyof RenderParams>(param: K, value: RenderParams[K]) => {
        setParams(prev => ({ ...prev, [param]: value }));
    }, []);

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const toggleGuide = useCallback(() => {
        setIsGuideVisible(prev => !prev);
    }, []);
    
    const handleExportSVG = useCallback(() => {
        const svgEl = document.querySelector('#character-display-area svg');
        if (!svgEl) {
            alert('Could not find SVG to export.');
            return;
        }

        const svgNode = svgEl.cloneNode(true) as SVGSVGElement;

        if (includeBgInExport) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', '#000000');
            svgNode.prepend(rect);
        }

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgNode);
        
        // Add xmlns if it's missing, which can happen on clone
        if(!svgString.match(/^<svg[^>]+"http:\/\/www.w3.org\/2000\/svg"/)){
            svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hexagon-font.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    }, [includeBgInExport]);


    return (
        <div className="max-w-7xl mx-auto relative">
            {/* Version Tag */}
            <div className="fixed top-3 left-3 z-40 text-[10px] md:text-xs font-mono text-gray-500 opacity-60 select-none pointer-events-none">
                v1.0.0 • {new Date().toLocaleDateString()}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-500 mb-6">Hexagon Cube Font Editor</h1>

            <ControlsPanel 
                params={params} 
                onParamChange={handleParamChange} 
                isGuideVisible={isGuideVisible}
                onToggleGuide={toggleGuide}
                includeBgInExport={includeBgInExport}
                onIncludeBgChange={setIncludeBgInExport}
                onExportSVG={handleExportSVG}
            />
            
            <div className="mb-8">
                <label htmlFor="text-input" className="block mb-2 text-lg font-medium text-gray-300">Your Text:</label>
                <textarea 
                    id="text-input" 
                    rows={4} 
                    className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                    value={text}
                    onChange={handleTextChange}
                />
            </div>

            <CharacterGrid text={text} params={params} />

            <EdgeGuide isVisible={isGuideVisible} onClose={toggleGuide} />

        </div>
    );
};

export default App;