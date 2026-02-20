import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type { LayerNode, NetworkEdge, LayerDefinition, LayerNodeData } from '@/types/network';

interface HistoryEntry {
  nodes: LayerNode[];
  edges: NetworkEdge[];
}

interface NetworkState {
  nodes: LayerNode[];
  edges: NetworkEdge[];
  selectedNodeId: string | null;
  history: HistoryEntry[];
  historyIndex: number;

  onNodesChange: (changes: NodeChange<LayerNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<NetworkEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (layer: LayerDefinition, position: { x: number; y: number }) => void;
  addNodeWithEdge: (
    layer: LayerDefinition,
    position: { x: number; y: number },
    anchorNodeId: string,
    handleType: 'source' | 'target',
  ) => void;
  selectNode: (id: string | null) => void;
  updateNodeParam: (nodeId: string, key: string, value: number | string | boolean) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  exportJSON: () => string;
  loadFromJSON: (json: string) => void;
  pushHistory: () => void;
}

const DEFAULT_NODES: LayerNode[] = [
  {
    id: 'input-1',
    type: 'layerNode',
    position: { x: 250, y: 0 },
    data: { label: 'Input', layerType: 'input', category: 'utility', params: {} },
  },
  {
    id: 'dense-1',
    type: 'layerNode',
    position: { x: 250, y: 120 },
    data: { label: 'Dense', layerType: 'dense', category: 'burn', params: { units: 64, activation: 'relu' } },
  },
  {
    id: 'activation-1',
    type: 'layerNode',
    position: { x: 250, y: 240 },
    data: { label: 'Activation', layerType: 'activation', category: 'burn', params: { function: 'relu' } },
  },
  {
    id: 'dropout-1',
    type: 'layerNode',
    position: { x: 250, y: 360 },
    data: { label: 'Dropout', layerType: 'dropout', category: 'burn', params: { rate: 0.5 } },
  },
  {
    id: 'dense-2',
    type: 'layerNode',
    position: { x: 250, y: 480 },
    data: { label: 'Dense', layerType: 'dense', category: 'burn', params: { units: 32, activation: 'relu' } },
  },
  {
    id: 'output-1',
    type: 'layerNode',
    position: { x: 250, y: 600 },
    data: { label: 'Output', layerType: 'output', category: 'utility', params: {} },
  },
];

const DEFAULT_EDGES: NetworkEdge[] = [
  { id: 'e-input-dense1', source: 'input-1', target: 'dense-1' },
  { id: 'e-dense1-act', source: 'dense-1', target: 'activation-1' },
  { id: 'e-act-drop', source: 'activation-1', target: 'dropout-1' },
  { id: 'e-drop-dense2', source: 'dropout-1', target: 'dense-2' },
  { id: 'e-dense2-out', source: 'dense-2', target: 'output-1' },
];

let nodeCounter = 10;

export const useNetworkStore = create<NetworkState>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,
  history: [{ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES }],
  historyIndex: 0,

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
    get().pushHistory();
  },

  addNode: (layer, position) => {
    const id = `${layer.type}-${++nodeCounter}`;
    const newNode: LayerNode = {
      id,
      type: 'layerNode',
      position,
      data: {
        label: layer.label,
        layerType: layer.type,
        category: layer.category,
        params: { ...layer.defaultParams },
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
    get().pushHistory();
  },

  addNodeWithEdge: (layer, position, anchorNodeId, handleType) => {
    const id = `${layer.type}-${++nodeCounter}`;
    const newNode: LayerNode = {
      id,
      type: 'layerNode',
      position,
      data: {
        label: layer.label,
        layerType: layer.type,
        category: layer.category,
        params: { ...layer.defaultParams },
      },
    };
    const edge: NetworkEdge =
      handleType === 'source'
        ? { id: `e-${anchorNodeId}-${id}`, source: anchorNodeId, target: id }
        : { id: `e-${id}-${anchorNodeId}`, source: id, target: anchorNodeId };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, edge],
    }));
    get().pushHistory();
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeParam: (nodeId, key, value) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, params: { ...n.data.params, [key]: value } } as LayerNodeData }
          : n,
      ),
    }));
    get().pushHistory();
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
    get().pushHistory();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    }));
    get().pushHistory();
  },

  pushHistory: () => {
    set((state) => {
      const newEntry = { nodes: [...state.nodes], edges: [...state.edges] };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newEntry);
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]!;
      set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]!;
      set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  exportJSON: () => {
    const { nodes, edges } = get();
    const architecture = {
      version: '1.0',
      layers: nodes.map((n) => ({
        id: n.id,
        type: n.data.layerType,
        label: n.data.label,
        category: n.data.category,
        params: n.data.params,
        position: n.position,
      })),
      connections: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };
    return JSON.stringify(architecture, null, 2);
  },

  loadFromJSON: (json) => {
    const data = JSON.parse(json);
    const nodes: LayerNode[] = data.layers.map((l: Record<string, unknown>) => ({
      id: l.id as string,
      type: 'layerNode',
      position: l.position as { x: number; y: number },
      data: {
        label: l.label as string,
        layerType: l.type as string,
        category: l.category as string,
        params: l.params as Record<string, unknown>,
      },
    }));
    const edges: NetworkEdge[] = data.connections.map((c: Record<string, unknown>) => ({
      id: c.id as string,
      source: c.source as string,
      target: c.target as string,
    }));
    set({ nodes, edges, selectedNodeId: null });
    get().pushHistory();
  },
}));
