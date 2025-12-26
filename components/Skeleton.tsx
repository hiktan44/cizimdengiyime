/**
 * Skeleton Loading Components
 * Veri yüklenirken gösterilen placeholderlar
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
}) => {
  const baseClasses = 'skeleton bg-slate-800';

  const variantClasses = {
    text: 'h-4 rounded w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-lg',
  };

  const styleProps = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={styleProps}
    />
  );
};

// Card Skeleton
interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-start gap-4">
            <Skeleton variant="circular" width={56} height={56} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={20} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="40%" height={16} />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton width="100%" height={12} />
            <Skeleton width="90%" height={12} />
            <Skeleton width="70%" height={12} />
          </div>
        </div>
      ))}
    </>
  );
};

// Feature Card Skeleton
export const FeatureCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 space-y-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="space-y-2">
        <Skeleton width="70%" height={24} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="80%" height={16} />
      </div>
    </div>
  );
};

// Testimonial Skeleton
export const TestimonialSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 space-y-4">
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="circular" width={20} height={20} />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="95%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="85%" height={16} />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton width={100} height={12} />
        </div>
      </div>
    </div>
  );
};

// Pricing Card Skeleton
export const PricingCardSkeleton: React.FC<{ popular?: boolean }> = ({ popular }) => {
  return (
    <div className={`bg-slate-900/50 border ${popular ? 'border-cyan-500' : 'border-slate-700'} rounded-2xl p-8 text-center space-y-4 relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 skeleton rounded-full" />
      )}
      <Skeleton width="80%" height={48} className="mx-auto" />
      <Skeleton width="40%" height={16} className="mx-auto" />
      <Skeleton width="60%" height={36} className="mx-auto" />
      <Skeleton width="100%" height={16} className="mx-auto" />
      <Skeleton width="100%" height={48} className="mx-auto rounded-lg" />
    </div>
  );
};

// Image Skeleton
export const ImageSkeleton: React.FC<{ aspectRatio?: string }> = ({ aspectRatio = '3/4' }) => {
  const [width, height] = aspectRatio.split('/').map(Number);
  const paddingHeight = (height / width) * 100;

  return (
    <div className="relative w-full bg-slate-800 rounded-xl overflow-hidden" style={{ paddingBottom: `${paddingHeight}%` }}>
      <div className="absolute inset-0 skeleton" />
    </div>
  );
};

// Button Skeleton
export const ButtonSkeleton: React.FC<{ width?: string | number }> = ({ width }) => {
  return (
    <Skeleton
      variant="rounded"
      width={width || '100%'}
      height={48}
      className="skeleton"
    />
  );
};

// Form Input Skeleton
export const InputSkeleton: React.FC<{ label?: boolean }> = ({ label = true }) => {
  return (
    <div className="space-y-2">
      {label && <Skeleton width="30%" height={16} />}
      <Skeleton width="100%" height={48} variant="rounded" />
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-700">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={index}
          width={`${100 / columns}%`}
          height={16}
          className="flex-1"
        />
      ))}
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
      <Skeleton width={100} height={60} className="mx-auto" />
      <Skeleton width="60%" height={20} className="mx-auto" />
    </div>
  );
};

// Avatar Skeleton
export const AvatarSkeleton: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <Skeleton variant="circular" width={size} height={size} />
  );
};

// Gallery Skeleton
export const GallerySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ImageSkeleton key={index} />
      ))}
    </div>
  );
};

// Loading Spinner with Text
export const LoadingSpinner: React.FC<{
  text?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ text, progress, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md px-6">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center font-bold text-cyan-400 text-sm">
            {Math.round(progress)}%
          </div>
        )}
      </div>

      {text && (
        <div className="w-full space-y-3">
          <p className="text-slate-300 font-medium animate-pulse text-center">{text}</p>
          {progress !== undefined && (
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600">
              <div
                className="progress-gradient h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${Math.max(5, Math.round(progress))}%` }}
              />
            </div>
          )}
          <p className="text-xs text-slate-500 text-center">İşlem yoğunluğuna göre süre değişebilir.</p>
        </div>
      )}
    </div>
  );
};

// Shimmer Overlay
export const ShimmerOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// Page Loader
export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="text-slate-400 animate-pulse">Yükleniyor...</p>
      </div>
    </div>
  );
};

// Inline Loader (smaller)
export const InlineLoader: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-3',
  };

  return (
    <div
      className={`border-slate-700 border-t-cyan-400 rounded-full animate-spin ${sizeClasses[size]}`}
    />
  );
};

