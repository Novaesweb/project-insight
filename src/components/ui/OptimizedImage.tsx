import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty' | 'color';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = React.memo<OptimizedImageProps>(({
  src,
  alt,
  className,
  width,
  height,
  quality = 75,
  format = 'auto',
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (loading === 'lazy' && !isInView) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [loading, isInView]);

  // Gerar URLs otimizadas para diferentes formatos
  const getOptimizedSrc = (originalSrc: string, imgFormat: string) => {
    // Se for URL externa, retornar como está
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Para assets locais, aplicar otimizações
    const baseUrl = originalSrc.split('.')[0];
    const extension = originalSrc.split('.').pop();
    
    if (imgFormat === 'webp' && extension !== 'webp') {
      return `${baseUrl}.webp`;
    }
    
    if (imgFormat === 'avif' && extension !== 'avif') {
      return `${baseUrl}.avif`;
    }
    
    return originalSrc;
  };

  // Detectar suporte a formatos modernos
  const [supportedFormat, setSupportedFormat] = useState<'webp' | 'avif' | 'jpg'>('jpg');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Testar AVIF
      const avifData = canvas.toDataURL('image/avif');
      if (avifData.indexOf('data:image/avif') === 0) {
        setSupportedFormat('avif');
        return;
      }
      
      // Testar WebP
      const webpData = canvas.toDataURL('image/webp');
      if (webpData.indexOf('data:image/webp') === 0) {
        setSupportedFormat('webp');
        return;
      }
    }
    
    setSupportedFormat('jpg');
  }, []);

  const optimizedSrc = getOptimizedSrc(src, format === 'auto' ? supportedFormat : format);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Gerar placeholder blur
  const generateBlurPlaceholder = () => {
    if (blurDataURL) {
      return blurDataURL;
    }
    
    // Placeholder color baseado na imagem
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjwvc3ZnPg==';
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && placeholder !== 'empty' && (
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            backgroundImage: placeholder === 'blur' ? `url(${generateBlurPlaceholder()})` : undefined,
            backgroundColor: placeholder === 'color' ? '#f4f4f4' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {placeholder === 'color' && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}
        </div>
      )}

      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={cn(
          'transition-all duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'grayscale',
          'w-full h-full object-cover'
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />

      {/* Fallback para erro */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
