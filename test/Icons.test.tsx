import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import { VideoIcon } from '../components/icons/VideoIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';

describe('Icon Components', () => {
  it('should render SparklesIcon', () => {
    const { container } = render(<SparklesIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render UploadIcon', () => {
    const { container } = render(<UploadIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render VideoIcon', () => {
    const { container } = render(<VideoIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render CheckCircleIcon', () => {
    const { container } = render(<CheckCircleIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render DownloadIcon', () => {
    const { container } = render(<DownloadIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
