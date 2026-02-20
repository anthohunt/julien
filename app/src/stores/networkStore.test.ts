import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @xyflow/react before importing the store
vi.mock('@xyflow/react', () => ({
  applyNodeChanges: vi.fn((_changes: unknown[], nodes: unknown[]) => nodes),
  applyEdgeChanges: vi.fn((_changes: unknown[], edges: unknown[]) => edges),
  addEdge: vi.fn((conn: unknown, edges: unknown[]) => [...edges, { id: `e-${Date.now()}`, ...conn as object }]),
}));

import { useNetworkStore } from './networkStore';
import { BURN_LAYERS, UTILITY_LAYERS } from '@/types/network';

describe('US-E1: Drag & drop layers to canvas', () => {
  beforeEach(() => {
    useNetworkStore.setState(useNetworkStore.getInitialState());
  });

  it('loads with a default pre-built network', () => {
    const { nodes, edges } = useNetworkStore.getState();
    expect(nodes.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
    // Default has Input -> Dense -> Activation -> Dropout -> Dense -> Output
    const types = nodes.map((n) => n.data.layerType);
    expect(types).toContain('input');
    expect(types).toContain('output');
    expect(types).toContain('dense');
  });

  it('adds a node with correct data when addNode is called', () => {
    const initial = useNetworkStore.getState().nodes.length;
    const denseLayer = BURN_LAYERS.find((l) => l.type === 'dense')!;
    useNetworkStore.getState().addNode(denseLayer, { x: 100, y: 200 });

    const { nodes } = useNetworkStore.getState();
    expect(nodes.length).toBe(initial + 1);
    const added = nodes[nodes.length - 1]!;
    expect(added.data.layerType).toBe('dense');
    expect(added.data.label).toBe('Dense');
    expect(added.data.params).toEqual({ units: 64, activation: 'relu' });
    expect(added.position).toEqual({ x: 100, y: 200 });
  });

  it('can add all Burn layer types', () => {
    for (const layer of BURN_LAYERS) {
      useNetworkStore.getState().addNode(layer, { x: 0, y: 0 });
    }
    const { nodes } = useNetworkStore.getState();
    for (const layer of BURN_LAYERS) {
      expect(nodes.some((n) => n.data.layerType === layer.type)).toBe(true);
    }
  });

  it('can add all utility layer types', () => {
    for (const layer of UTILITY_LAYERS) {
      useNetworkStore.getState().addNode(layer, { x: 0, y: 0 });
    }
    const { nodes } = useNetworkStore.getState();
    for (const layer of UTILITY_LAYERS) {
      expect(nodes.some((n) => n.data.layerType === layer.type)).toBe(true);
    }
  });

  it('each added node gets a unique id', () => {
    const layer = BURN_LAYERS[0]!;
    useNetworkStore.getState().addNode(layer, { x: 0, y: 0 });
    useNetworkStore.getState().addNode(layer, { x: 50, y: 50 });
    const { nodes } = useNetworkStore.getState();
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('deletes a node and its connected edges', () => {
    const { nodes, edges } = useNetworkStore.getState();
    const denseNode = nodes.find((n) => n.data.layerType === 'dense')!;
    const edgesWithDense = edges.filter((e) => e.source === denseNode.id || e.target === denseNode.id);
    expect(edgesWithDense.length).toBeGreaterThan(0);

    useNetworkStore.getState().deleteNode(denseNode.id);
    const after = useNetworkStore.getState();
    expect(after.nodes.find((n) => n.id === denseNode.id)).toBeUndefined();
    expect(after.edges.filter((e) => e.source === denseNode.id || e.target === denseNode.id).length).toBe(0);
  });
});

describe('US-E2: Bezier connections between nodes', () => {
  beforeEach(() => {
    useNetworkStore.setState(useNetworkStore.getInitialState());
  });

  it('connects two nodes via onConnect', () => {
    const initial = useNetworkStore.getState().edges.length;
    useNetworkStore.getState().onConnect({ source: 'input-1', target: 'output-1', sourceHandle: null, targetHandle: null });
    expect(useNetworkStore.getState().edges.length).toBe(initial + 1);
  });

  it('deletes an edge', () => {
    const { edges } = useNetworkStore.getState();
    const edgeToDelete = edges[0]!;
    useNetworkStore.getState().deleteEdge(edgeToDelete.id);
    expect(useNetworkStore.getState().edges.find((e) => e.id === edgeToDelete.id)).toBeUndefined();
  });
});

describe('US-E3: Property inspector', () => {
  beforeEach(() => {
    useNetworkStore.setState(useNetworkStore.getInitialState());
  });

  it('selects a node', () => {
    const { nodes } = useNetworkStore.getState();
    useNetworkStore.getState().selectNode(nodes[0]!.id);
    expect(useNetworkStore.getState().selectedNodeId).toBe(nodes[0]!.id);
  });

  it('deselects a node', () => {
    useNetworkStore.getState().selectNode('input-1');
    useNetworkStore.getState().selectNode(null);
    expect(useNetworkStore.getState().selectedNodeId).toBeNull();
  });

  it('updates a node parameter', () => {
    const denseNode = useNetworkStore.getState().nodes.find((n) => n.data.layerType === 'dense')!;
    useNetworkStore.getState().updateNodeParam(denseNode.id, 'units', 128);
    const updated = useNetworkStore.getState().nodes.find((n) => n.id === denseNode.id)!;
    expect(updated.data.params.units).toBe(128);
  });

  it('updates string parameter', () => {
    const denseNode = useNetworkStore.getState().nodes.find((n) => n.data.layerType === 'dense')!;
    useNetworkStore.getState().updateNodeParam(denseNode.id, 'activation', 'sigmoid');
    const updated = useNetworkStore.getState().nodes.find((n) => n.id === denseNode.id)!;
    expect(updated.data.params.activation).toBe('sigmoid');
  });
});

describe('US-E4: Undo/redo', () => {
  beforeEach(() => {
    useNetworkStore.setState(useNetworkStore.getInitialState());
  });

  it('cannot undo at initial state', () => {
    expect(useNetworkStore.getState().canUndo()).toBe(false);
  });

  it('cannot redo at initial state', () => {
    expect(useNetworkStore.getState().canRedo()).toBe(false);
  });

  it('can undo after adding a node', () => {
    const initialCount = useNetworkStore.getState().nodes.length;
    const layer = BURN_LAYERS[0]!;
    useNetworkStore.getState().addNode(layer, { x: 0, y: 0 });
    expect(useNetworkStore.getState().nodes.length).toBe(initialCount + 1);
    expect(useNetworkStore.getState().canUndo()).toBe(true);

    useNetworkStore.getState().undo();
    expect(useNetworkStore.getState().nodes.length).toBe(initialCount);
  });

  it('can redo after undoing', () => {
    const layer = BURN_LAYERS[0]!;
    useNetworkStore.getState().addNode(layer, { x: 0, y: 0 });
    const afterAdd = useNetworkStore.getState().nodes.length;
    useNetworkStore.getState().undo();
    expect(useNetworkStore.getState().canRedo()).toBe(true);
    useNetworkStore.getState().redo();
    expect(useNetworkStore.getState().nodes.length).toBe(afterAdd);
  });

  it('redo is cleared when new action is taken after undo', () => {
    const layer = BURN_LAYERS[0]!;
    useNetworkStore.getState().addNode(layer, { x: 0, y: 0 });
    useNetworkStore.getState().undo();
    useNetworkStore.getState().addNode(layer, { x: 50, y: 50 });
    expect(useNetworkStore.getState().canRedo()).toBe(false);
  });
});

describe('US-E5: Export JSON', () => {
  beforeEach(() => {
    useNetworkStore.setState(useNetworkStore.getInitialState());
  });

  it('exports valid JSON', () => {
    const json = useNetworkStore.getState().exportJSON();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty('version', '1.0');
    expect(parsed).toHaveProperty('layers');
    expect(parsed).toHaveProperty('connections');
  });

  it('exports all nodes as layers', () => {
    const { nodes } = useNetworkStore.getState();
    const json = useNetworkStore.getState().exportJSON();
    const parsed = JSON.parse(json);
    expect(parsed.layers.length).toBe(nodes.length);
  });

  it('exports all edges as connections', () => {
    const { edges } = useNetworkStore.getState();
    const json = useNetworkStore.getState().exportJSON();
    const parsed = JSON.parse(json);
    expect(parsed.connections.length).toBe(edges.length);
  });

  it('exported layers have type, params, and position', () => {
    const json = useNetworkStore.getState().exportJSON();
    const parsed = JSON.parse(json);
    for (const layer of parsed.layers) {
      expect(layer).toHaveProperty('type');
      expect(layer).toHaveProperty('params');
      expect(layer).toHaveProperty('position');
    }
  });

  it('can load from exported JSON (roundtrip)', () => {
    const json = useNetworkStore.getState().exportJSON();
    // Add a node first to change state
    const layer = BURN_LAYERS[0]!;
    useNetworkStore.getState().addNode(layer, { x: 300, y: 300 });

    // Load original
    useNetworkStore.getState().loadFromJSON(json);
    const reexported = useNetworkStore.getState().exportJSON();
    expect(JSON.parse(reexported)).toEqual(JSON.parse(json));
  });
});
