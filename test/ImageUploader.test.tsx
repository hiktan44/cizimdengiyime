import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploader } from '../components/ImageUploader';

describe('ImageUploader Component', () => {
  it('should render upload area', () => {
    render(
      <ImageUploader
        onImageUpload={vi.fn()}
        imagePreviewUrl={undefined}
      />
    );

    const uploadText = screen.getByText(/sürükle/i);
    expect(uploadText).toBeInTheDocument();
  });

  it('should display preview when image is provided', () => {
    const mockUrl = 'data:image/png;base64,test';
    render(
      <ImageUploader
        onImageUpload={vi.fn()}
        imagePreviewUrl={mockUrl}
      />
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockUrl);
  });

  it('should call onImageUpload when file is selected', () => {
    const onImageUpload = vi.fn();
    render(
      <ImageUploader
        onImageUpload={onImageUpload}
        imagePreviewUrl={undefined}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onImageUpload).toHaveBeenCalledWith(file);
  });

  it('should only accept image files', () => {
    render(
      <ImageUploader
        onImageUpload={vi.fn()}
        imagePreviewUrl={undefined}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*');
  });
});
