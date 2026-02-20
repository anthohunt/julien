import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DeleteDatasetModal } from './DeleteDatasetModal';

describe('US-D6: Delete dataset modal', () => {
  it('renders confirmation message with dataset name', () => {
    render(
      <DeleteDatasetModal isOpen={true} datasetName="train.csv" onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(screen.getByText(/train\.csv/)).toBeInTheDocument();
    expect(screen.getByText(/supprimer le dataset/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <DeleteDatasetModal isOpen={false} datasetName="train.csv" onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(screen.queryByText(/train\.csv/)).not.toBeInTheDocument();
  });

  it('calls onConfirm then onClose when delete clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DeleteDatasetModal isOpen={true} datasetName="train.csv" onClose={onClose} onConfirm={onConfirm} />
    );
    await user.click(screen.getByRole('button', { name: /supprimer/i }));
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <DeleteDatasetModal isOpen={true} datasetName="train.csv" onClose={onClose} onConfirm={vi.fn()} />
    );
    await user.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });
});
