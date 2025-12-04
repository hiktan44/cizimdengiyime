import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from '../components/ColorPicker';

describe('ColorPicker Component', () => {
  it('should render with label', () => {
    render(
      <ColorPicker
        label="Test Color"
        selectedColor=""
        onColorChange={vi.fn()}
      />
    );

    const label = screen.getByText('Test Color');
    expect(label).toBeInTheDocument();
  });

  it('should display color options', () => {
    render(
      <ColorPicker
        label="Renk Seç"
        selectedColor=""
        onColorChange={vi.fn()}
      />
    );

    // Should have multiple color buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(5);
  });

  it('should call onColorChange when color is selected', () => {
    const onColorChange = vi.fn();
    render(
      <ColorPicker
        label="Renk Seç"
        selectedColor=""
        onColorChange={onColorChange}
      />
    );

    // Click first color button
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(onColorChange).toHaveBeenCalled();
  });

  it('should highlight selected color', () => {
    render(
      <ColorPicker
        label="Renk Seç"
        selectedColor="Kırmızı"
        onColorChange={vi.fn()}
      />
    );

    // The selected color name should be displayed in the label area
    const selectedText = screen.getByText('Kırmızı');
    expect(selectedText).toBeInTheDocument();
    
    // The button with the selected color should exist
    const selectedButton = screen.getByTitle('Kırmızı');
    expect(selectedButton).toBeInTheDocument();
  });
});
