import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultDisplay } from '../components/ResultDisplay';

describe('ResultDisplay Component', () => {
  it('should show loading state', () => {
    render(
      <ResultDisplay
        isLoading={true}
        loadingText="İşleniyor..."
        progress={50}
        generatedImageUrl={null}
        beforeImageUrl={undefined}
        sketchImageUrl={undefined}
        generatedVideoUrl={null}
        onDownload={vi.fn()}
        onConvertToVideo={vi.fn()}
        onShare={vi.fn()}
        isShareSupported={false}
      />
    );

    // Should show progress percentage
    const progressText = screen.getByText(/50%/);
    expect(progressText).toBeInTheDocument();
  });

  it('should display generated image when available', () => {
    const mockImageUrl = 'data:image/png;base64,test';
    render(
      <ResultDisplay
        isLoading={false}
        loadingText=""
        progress={100}
        generatedImageUrl={mockImageUrl}
        beforeImageUrl={undefined}
        sketchImageUrl={undefined}
        generatedVideoUrl={null}
        onDownload={vi.fn()}
        onConvertToVideo={vi.fn()}
        onShare={vi.fn()}
        isShareSupported={false}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should show video when generated', () => {
    const mockVideoUrl = 'data:video/mp4;base64,test';
    render(
      <ResultDisplay
        isLoading={false}
        loadingText=""
        progress={100}
        generatedImageUrl="image-url"
        beforeImageUrl={undefined}
        sketchImageUrl={undefined}
        generatedVideoUrl={mockVideoUrl}
        onDownload={vi.fn()}
        onConvertToVideo={vi.fn()}
        onShare={vi.fn()}
        isShareSupported={false}
      />
    );

    // Video element should exist
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', mockVideoUrl);
  });

  it('should show empty state when no content', () => {
    render(
      <ResultDisplay
        isLoading={false}
        loadingText=""
        progress={0}
        generatedImageUrl={null}
        beforeImageUrl={undefined}
        sketchImageUrl={undefined}
        generatedVideoUrl={null}
        onDownload={vi.fn()}
        onConvertToVideo={vi.fn()}
        onShare={vi.fn()}
        isShareSupported={false}
      />
    );

    const emptyMessage = screen.getByText(/oluşturulan/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('should display progress bar during loading', () => {
    render(
      <ResultDisplay
        isLoading={true}
        loadingText="Yükleniyor..."
        progress={75}
        generatedImageUrl={null}
        beforeImageUrl={undefined}
        sketchImageUrl={undefined}
        generatedVideoUrl={null}
        onDownload={vi.fn()}
        onConvertToVideo={vi.fn()}
        onShare={vi.fn()}
        isShareSupported={false}
      />
    );

    // Progress should be visible
    const progressText = screen.getByText(/75%/);
    expect(progressText).toBeInTheDocument();
  });
});
