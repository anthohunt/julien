import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LayerPalette } from './LayerPalette';
import { BURN_LAYERS, UTILITY_LAYERS } from '@/types/network';

describe('LayerPalette', () => {
  it('renders all Burn layer items', () => {
    render(<LayerPalette />);
    for (const layer of BURN_LAYERS) {
      expect(screen.getByText(layer.label)).toBeInTheDocument();
    }
  });

  it('renders all utility layer items', () => {
    render(<LayerPalette />);
    for (const layer of UTILITY_LAYERS) {
      expect(screen.getByText(layer.label)).toBeInTheDocument();
    }
  });

  it('renders category headings', () => {
    render(<LayerPalette />);
    expect(screen.getByText('Layers Burn')).toBeInTheDocument();
    expect(screen.getByText('Utilitaires')).toBeInTheDocument();
  });

  it('each layer item is draggable', () => {
    render(<LayerPalette />);
    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item).toHaveAttribute('draggable', 'true');
    }
  });
});
