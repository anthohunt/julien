import type { Node, Edge } from '@xyflow/react';

export type LayerCategory = 'burn' | 'utility';

export interface LayerDefinition {
  type: string;
  label: string;
  category: LayerCategory;
  defaultParams: Record<string, number | string | boolean>;
}

export interface LayerNodeData {
  label: string;
  layerType: string;
  category: LayerCategory;
  params: Record<string, number | string | boolean>;
  [key: string]: unknown;
}

export type LayerNode = Node<LayerNodeData>;
export type NetworkEdge = Edge;

export const BURN_LAYERS: LayerDefinition[] = [
  { type: 'dense', label: 'Dense', category: 'burn', defaultParams: { units: 64, activation: 'relu' } },
  { type: 'dropout', label: 'Dropout', category: 'burn', defaultParams: { rate: 0.5 } },
  { type: 'conv', label: 'Conv', category: 'burn', defaultParams: { filters: 32, kernel_size: 3 } },
  { type: 'lstm', label: 'LSTM', category: 'burn', defaultParams: { units: 64, return_sequences: false } },
  { type: 'transformer', label: 'Transformer', category: 'burn', defaultParams: { heads: 8, d_model: 512 } },
  { type: 'activation', label: 'Activation', category: 'burn', defaultParams: { function: 'relu' } },
  { type: 'batchnorm', label: 'BatchNorm', category: 'burn', defaultParams: { momentum: 0.1, epsilon: 0.00001 } },
];

export const UTILITY_LAYERS: LayerDefinition[] = [
  { type: 'input', label: 'Input', category: 'utility', defaultParams: {} },
  { type: 'output', label: 'Output', category: 'utility', defaultParams: {} },
  { type: 'reshape', label: 'Reshape', category: 'utility', defaultParams: {} },
  { type: 'concat', label: 'Concat', category: 'utility', defaultParams: {} },
  { type: 'split', label: 'Split', category: 'utility', defaultParams: {} },
];

export const ALL_LAYERS: LayerDefinition[] = [...BURN_LAYERS, ...UTILITY_LAYERS];

/* ── Connection grammar (re-exported from connectionGrammar.ts) ── */
export { canConnect, getCompatibleLayers, getLayerRole, hasInputHandle, hasOutputHandle } from './connectionGrammar';
export type { LayerRole } from './connectionGrammar';
