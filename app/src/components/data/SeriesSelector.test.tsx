import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SeriesSelector } from './SeriesSelector';

const series = ['productA', 'productB', 'productC'];
const selectedSeries = ['productA', 'productC'];

describe('US-D4: Series selection for training with checkboxes', () => {
  it('renders a checkbox for each series', () => {
    render(
      <SeriesSelector
        series={series}
        selectedSeries={selectedSeries}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // 3 series checkboxes
    expect(checkboxes).toHaveLength(3);
  });

  it('shows checked state for selected series', () => {
    render(
      <SeriesSelector
        series={series}
        selectedSeries={selectedSeries}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    );
    const checkboxA = screen.getByLabelText('productA');
    const checkboxB = screen.getByLabelText('productB');
    const checkboxC = screen.getByLabelText('productC');
    expect(checkboxA).toBeChecked();
    expect(checkboxB).not.toBeChecked();
    expect(checkboxC).toBeChecked();
  });

  it('calls onToggle when a checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <SeriesSelector
        series={series}
        selectedSeries={selectedSeries}
        onToggle={onToggle}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    );
    await user.click(screen.getByLabelText('productB'));
    expect(onToggle).toHaveBeenCalledWith('productB');
  });

  it('has select all button', async () => {
    const user = userEvent.setup();
    const onSelectAll = vi.fn();
    render(
      <SeriesSelector
        series={series}
        selectedSeries={selectedSeries}
        onToggle={vi.fn()}
        onSelectAll={onSelectAll}
        onDeselectAll={vi.fn()}
      />
    );
    await user.click(screen.getByText(/tout selectionner/i));
    expect(onSelectAll).toHaveBeenCalled();
  });

  it('has deselect all button', async () => {
    const user = userEvent.setup();
    const onDeselectAll = vi.fn();
    render(
      <SeriesSelector
        series={series}
        selectedSeries={selectedSeries}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={onDeselectAll}
      />
    );
    await user.click(screen.getByText(/tout deselectionner/i));
    expect(onDeselectAll).toHaveBeenCalled();
  });

  it('shows selection count', () => {
    render(
      <SeriesSelector
        series={series}
        selectedSeries={selectedSeries}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    );
    expect(screen.getByText(/2.*\/.*3/)).toBeInTheDocument();
  });
});
