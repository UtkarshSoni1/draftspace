'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
} from 'lucide-react';

type ElementType = 'text' | 'shape' | 'image' | 'code' | null;

interface TextProperties {
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

interface ShapeProperties {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

interface ImageProperties {
  width: number;
  height: number;
  opacity: number;
  filter: 'none' | 'grayscale' | 'blur' | 'brightness';
}

interface CodeProperties {
  language: string;
  theme: string;
  fontSize: number;
}

interface SelectedElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  textProps?: TextProperties;
  shapeProps?: ShapeProperties;
  imageProps?: ImageProperties;
  codeProps?: CodeProperties;
}

interface PropertiesPanelProps {
  selectedElement: SelectedElement | null;
  onPropertyChange?: (elementId: string, property: string, value: any) => void;
  onDelete?: (elementId: string) => void;
  onDuplicate?: (elementId: string) => void;
  onBringToFront?: (elementId: string) => void;
  onSendToBack?: (elementId: string) => void;
}

export default function PropertiesPanel({
  selectedElement,
  onPropertyChange,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}: PropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    position: true,
    size: true,
    properties: true,
    layers: true,
  });

  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);

  if (!selectedElement) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePropertyChange = (property: string, value: any) => {
    onPropertyChange?.(selectedElement.id, property, value);
  };

  const fontFamilies = ['Arial', 'Georgia', 'Courier', 'Verdana', 'Times New Roman'];
  const languages = ['JavaScript', 'Python', 'Java', 'CSS', 'HTML'];
  const themes = ['Light', 'Dark', 'Dracula', 'Monokai'];
  const filters = ['None', 'Grayscale', 'Blur', 'Brightness'];
  const alignments = ['Left', 'Center', 'Right'];

  const typeLabel = selectedElement.type
    ? selectedElement.type.charAt(0).toUpperCase() +
      selectedElement.type.slice(1)
    : 'Element';

  return (
    <div
      className="fixed right-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-80 bg-white border-l border-slate-200 shadow-lg overflow-y-auto transition-all duration-300 ease-out animate-in slide-in-from-right fade-in"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
        <h2 className="text-lg font-semibold text-slate-900">
          {typeLabel} Properties
        </h2>
        <p className="text-xs text-slate-500 mt-1">ID: {selectedElement.id}</p>
      </div>

      {/* Position Section */}
      <CollapsibleSection
        title="Position"
        icon="📍"
        expanded={expandedSections.position}
        onToggle={() => toggleSection('position')}
      >
        <div className="space-y-3">
          <InputField
            label="X"
            value={selectedElement.x}
            onChange={(val) => handlePropertyChange('x', val)}
            type="number"
          />
          <InputField
            label="Y"
            value={selectedElement.y}
            onChange={(val) => handlePropertyChange('y', val)}
            type="number"
          />
        </div>
      </CollapsibleSection>

      {/* Size Section */}
      <CollapsibleSection
        title="Size"
        icon="⬚"
        expanded={expandedSections.size}
        onToggle={() => toggleSection('size')}
      >
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <InputField
                label="Width"
                value={selectedElement.width}
                onChange={(val) => handlePropertyChange('width', val)}
                type="number"
              />
            </div>
            <button
              onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {aspectRatioLocked ? (
                <Lock className="w-4 h-4 text-slate-600" />
              ) : (
                <Unlock className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
          <InputField
            label="Height"
            value={selectedElement.height}
            onChange={(val) => handlePropertyChange('height', val)}
            type="number"
          />
        </div>
      </CollapsibleSection>

      {/* Element-Specific Properties */}
      {selectedElement.type === 'text' && selectedElement.textProps && (
        <CollapsibleSection
          title="Text"
          icon="✏️"
          expanded={expandedSections.properties}
          onToggle={() => toggleSection('properties')}
        >
          <div className="space-y-3">
            <SliderField
              label="Font Size"
              value={selectedElement.textProps.fontSize}
              min={8}
              max={72}
              onChange={(val) => handlePropertyChange('textProps.fontSize', val)}
            />
            <SelectField
              label="Font Family"
              value={selectedElement.textProps.fontFamily}
              options={fontFamilies}
              onChange={(val) => handlePropertyChange('textProps.fontFamily', val)}
            />
            <ColorField
              label="Color"
              value={selectedElement.textProps.color}
              onChange={(val) => handlePropertyChange('textProps.color', val)}
            />
            <SelectField
              label="Alignment"
              value={selectedElement.textProps.alignment}
              options={alignments}
              onChange={(val) => handlePropertyChange('textProps.alignment', val)}
            />
            <ResetButton
              onClick={() => handlePropertyChange('textProps', {
                fontSize: 16,
                fontFamily: 'Arial',
                color: '#000000',
                alignment: 'left',
              })}
            />
          </div>
        </CollapsibleSection>
      )}

      {selectedElement.type === 'shape' && selectedElement.shapeProps && (
        <CollapsibleSection
          title="Shape"
          icon="◯"
          expanded={expandedSections.properties}
          onToggle={() => toggleSection('properties')}
        >
          <div className="space-y-3">
            <ColorField
              label="Fill Color"
              value={selectedElement.shapeProps.fillColor}
              onChange={(val) => handlePropertyChange('shapeProps.fillColor', val)}
            />
            <ColorField
              label="Stroke Color"
              value={selectedElement.shapeProps.strokeColor}
              onChange={(val) => handlePropertyChange('shapeProps.strokeColor', val)}
            />
            <SliderField
              label="Stroke Width"
              value={selectedElement.shapeProps.strokeWidth}
              min={0}
              max={10}
              onChange={(val) => handlePropertyChange('shapeProps.strokeWidth', val)}
            />
            <SliderField
              label="Opacity"
              value={selectedElement.shapeProps.opacity}
              min={0}
              max={100}
              onChange={(val) => handlePropertyChange('shapeProps.opacity', val)}
              suffix="%"
            />
            <ResetButton
              onClick={() => handlePropertyChange('shapeProps', {
                fillColor: '#ffffff',
                strokeColor: '#000000',
                strokeWidth: 2,
                opacity: 100,
              })}
            />
          </div>
        </CollapsibleSection>
      )}

      {selectedElement.type === 'image' && selectedElement.imageProps && (
        <CollapsibleSection
          title="Image"
          icon="🖼️"
          expanded={expandedSections.properties}
          onToggle={() => toggleSection('properties')}
        >
          <div className="space-y-3">
            <InputField
              label="Width"
              value={selectedElement.imageProps.width}
              onChange={(val) => handlePropertyChange('imageProps.width', val)}
              type="number"
            />
            <InputField
              label="Height"
              value={selectedElement.imageProps.height}
              onChange={(val) => handlePropertyChange('imageProps.height', val)}
              type="number"
            />
            <SliderField
              label="Opacity"
              value={selectedElement.imageProps.opacity}
              min={0}
              max={100}
              onChange={(val) => handlePropertyChange('imageProps.opacity', val)}
              suffix="%"
            />
            <SelectField
              label="Filter"
              value={selectedElement.imageProps.filter}
              options={filters}
              onChange={(val) => handlePropertyChange('imageProps.filter', val)}
            />
            <ResetButton
              onClick={() => handlePropertyChange('imageProps', {
                width: 200,
                height: 200,
                opacity: 100,
                filter: 'none',
              })}
            />
          </div>
        </CollapsibleSection>
      )}

      {selectedElement.type === 'code' && selectedElement.codeProps && (
        <CollapsibleSection
          title="Code"
          icon="💻"
          expanded={expandedSections.properties}
          onToggle={() => toggleSection('properties')}
        >
          <div className="space-y-3">
            <SelectField
              label="Language"
              value={selectedElement.codeProps.language}
              options={languages}
              onChange={(val) => handlePropertyChange('codeProps.language', val)}
            />
            <SelectField
              label="Theme"
              value={selectedElement.codeProps.theme}
              options={themes}
              onChange={(val) => handlePropertyChange('codeProps.theme', val)}
            />
            <SliderField
              label="Font Size"
              value={selectedElement.codeProps.fontSize}
              min={8}
              max={24}
              onChange={(val) => handlePropertyChange('codeProps.fontSize', val)}
            />
            <ResetButton
              onClick={() => handlePropertyChange('codeProps', {
                language: 'JavaScript',
                theme: 'Dark',
                fontSize: 12,
              })}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Layer Controls Section */}
      <CollapsibleSection
        title="Layers"
        icon="📚"
        expanded={expandedSections.layers}
        onToggle={() => toggleSection('layers')}
      >
        <div className="space-y-2">
          <button
            onClick={() => onBringToFront?.(selectedElement.id)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            Bring to Front
          </button>
          <button
            onClick={() => onSendToBack?.(selectedElement.id)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
            Send to Back
          </button>
        </div>
      </CollapsibleSection>

      {/* Action Buttons */}
      <div className="border-t border-slate-200 p-4 space-y-2">
        <button
          onClick={() => onDuplicate?.(selectedElement.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button
          onClick={() => onDelete?.(selectedElement.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && <div className="px-4 py-3 bg-slate-50">{children}</div>}
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

// Slider Field Component
function SliderField({
  label,
  value,
  min,
  max,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-slate-600">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-700">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

// Color Field Component
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-slate-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

// Select Field Component
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Reset Button Component
function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
    >
      Reset to Defaults
    </button>
  );
}
