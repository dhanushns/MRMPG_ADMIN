import React from 'react';
import { useImage } from '@/utils';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  width,
  height,
  style,
  onLoad,
  onError
}) => {
  const { imageUrl, loading, error } = useImage(src);

  React.useEffect(() => {
    if (!loading && !error && imageUrl && onLoad) {
      onLoad();
    }
    if (error && onError) {
      onError(error);
    }
  }, [loading, error, imageUrl, onLoad, onError]);


  if (loading) {
    return (
      <div 
        className={`authenticated-image-loading ${className}`}
        style={{
          width,
          height,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          ...style
        }}
      >
        <div style={{ fontSize: '12px', color: '#999' }}>Loading...</div>
      </div>
    );
  }

  // Show error or fallback image if loading failed
  if (error || !imageUrl) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          width={width}
          height={height}
          style={style}
        />
      );
    }

    return (
      <div 
        className={`authenticated-image-error ${className}`}
        style={{
          width,
          height,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          ...style
        }}
      >
        <div style={{ fontSize: '12px', color: '#999' }}>Failed to load</div>
      </div>
    );
  }

  // Render the successfully loaded image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
    />
  );
};

export default AuthenticatedImage;
