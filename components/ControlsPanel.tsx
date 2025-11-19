import React from 'react';
import type { RenderParams } from '../types';

interface ControlsPanelProps {
    params: RenderParams;
    onParamChange: <K extends keyof RenderParams>(param: K, value: RenderParams[K]) => void;
    isGuideVisible: boolean;
    onToggleGuide: () => void;
    includeBgInExport: boolean;
    onIncludeBgChange: (checked: boolean) => void;
    onExportSVG: () => void;
}

const RangeControl: React.FC<{
    id: keyof RenderParams;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ id, label, value, min, max, step, onChange }) => (
    <div className="control-group">
        <label htmlFor={String(id)} className="flex justify-between items-center text-xs font-medium text-gray-400">
            <span>{label}</span>
            <span className="font-bold text-blue-400">{value}</span>
        </label>
        <input
            id={String(id)}
            type="range"
            min={min}
            max={max}
            value={value}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const ControlsPanel: React.FC<ControlsPanelProps> = ({ params, onParamChange, isGuideVisible, onToggleGuide, includeBgInExport, onIncludeBgChange, onExportSVG }) => {
    const isFlickerAmountDisabled = params.flickerSpeed <= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6 bg-gray-900 p-4 rounded-lg">
            {/* Column 1: Grid & Opacity */}
            <div className="space-y-3">
                <RangeControl id="hexagonSize" label="Hexagon Size" value={params.hexagonSize} min={20} max={200} step={1} onChange={(v) => onParamChange('hexagonSize', v)} />
                <RangeControl id="hexagonGap" label="Gap" value={params.hexagonGap} min={-100} max={50} step={1} onChange={(v) => onParamChange('hexagonGap', v)} />
                <RangeControl id="thinOpacity" label="Skeleton Opacity" value={params.thinOpacity} min={0} max={1} step={0.05} onChange={(v) => onParamChange('thinOpacity', v)} />
                
                <div className="pt-3 border-t border-gray-700 space-y-3">
                    <div className="control-group">
                        <label htmlFor="grid-color" className="text-xs font-medium text-gray-400 text-center block mb-1">Grid Color</label>
                        <input id="grid-color" type="color" value={params.gridColor} onChange={(e) => onParamChange('gridColor', e.target.value)} className="w-full h-10 p-1 bg-gray-800 border border-gray-600 rounded-lg" />
                    </div>
                    <RangeControl id="gridStrokeWidth" label="Grid Thickness" value={params.gridStrokeWidth} min={0.1} max={10} step={0.1} onChange={(v) => onParamChange('gridStrokeWidth', v)} />
                    <RangeControl id="gridOpacity" label="Grid Opacity" value={params.gridOpacity} min={0} max={1} step={0.05} onChange={(v) => onParamChange('gridOpacity', v)} />
                </div>
            </div>

            {/* Column 2: Thickness & Flicker */}
            <div className="space-y-3">
                <RangeControl id="thickStroke" label="Letter Thickness" value={params.thickStroke} min={1} max={20} step={0.5} onChange={(v) => onParamChange('thickStroke', v)} />
                <RangeControl id="thinStroke" label="Skeleton Thickness" value={params.thinStroke} min={0} max={20} step={0.5} onChange={(v) => onParamChange('thinStroke', v)} />
                <RangeControl id="vertexSize" label="Vertex Size" value={params.vertexSize} min={0} max={30} step={0.5} onChange={(v) => onParamChange('vertexSize', v)} />
                <RangeControl id="flickerSpeed" label="Flicker Speed" value={params.flickerSpeed} min={0} max={10} step={0.5} onChange={(v) => onParamChange('flickerSpeed', v)} />
                <div className={`control-group transition-opacity ${isFlickerAmountDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                     <label htmlFor="flickerAmount" className="flex justify-between items-center text-xs font-medium text-gray-400">
                        <span>Flicker Edges (%)</span>
                        <span className="font-bold text-blue-400">{params.flickerAmount}</span>
                    </label>
                    <input
                        id="flickerAmount"
                        type="range"
                        min={0}
                        max={100}
                        value={params.flickerAmount}
                        step={5}
                        onChange={(e) => onParamChange('flickerAmount', parseFloat(e.target.value))}
                        disabled={isFlickerAmountDisabled}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Column 3: Colors & Actions */}
            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    <div className="control-group">
                        <label htmlFor="thick-color" className="text-xs font-medium text-gray-400 text-center block">Letter</label>
                        <input id="thick-color" type="color" value={params.thickColor} onChange={(e) => onParamChange('thickColor', e.target.value)} className="w-full h-10 p-1 bg-gray-800 border border-gray-600 rounded-lg" />
                    </div>
                    <div className="control-group">
                        <label htmlFor="thin-color" className="text-xs font-medium text-gray-400 text-center block">Skeleton</label>
                        <input id="thin-color" type="color" value={params.thinColor} onChange={(e) => onParamChange('thinColor', e.target.value)} className="w-full h-10 p-1 bg-gray-800 border border-gray-600 rounded-lg" />
                    </div>
                    <div className="control-group">
                        <label htmlFor="vertex-color" className="text-xs font-medium text-gray-400 text-center block">Vertices</label>
                        <input id="vertex-color" type="color" value={params.vertexColor} onChange={(e) => onParamChange('vertexColor', e.target.value)} className="w-full h-10 p-1 bg-gray-800 border border-gray-600 rounded-lg" />
                    </div>
                </div>
                <div className="control-group pt-2">
                    <button
                        onClick={onToggleGuide}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {isGuideVisible ? 'Hide' : 'Show'} Edge Guide
                    </button>
                </div>
                <div className="control-group pt-2 border-t border-gray-700 space-y-2">
                    <button
                        onClick={onExportSVG}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Export to SVG
                    </button>
                    <label className="flex items-center justify-center text-sm text-gray-400 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={includeBgInExport}
                            onChange={(e) => onIncludeBgChange(e.target.checked)}
                            className="mr-2 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        Include Background
                    </label>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ControlsPanel);
