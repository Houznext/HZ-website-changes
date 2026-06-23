import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { lbIconProps } from './icons';

export type LightboxImage = {
  id: string;
  url: string;
  alt?: string;
};

type Props = {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

function imageFilename(url: string, index: number): string {
  const part = url.split('/').pop()?.split('?')[0];
  if (part && /\.[a-z0-9]{2,5}$/i.test(part)) return part;
  return `livebuild-photo-${index + 1}.jpg`;
}

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export default function ImageLightbox({ images, index, onClose, onIndexChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const open = index != null && images.length > 0;
  const current = open ? images[index] : null;
  const hasPrev = open && index > 0;
  const hasNext = open && index < images.length - 1;
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    if (index != null && index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index != null && index < images.length - 1) onIndexChange(index + 1);
  }, [images.length, index, onIndexChange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current || index == null || !mounted) return null;

  return createPortal(
    <div
      className="lb-image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <button
        type="button"
        className="lb-image-lightbox-close"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={18} {...lbIconProps()} />
      </button>

      {hasMultiple && (
        <button
          type="button"
          className="lb-image-lightbox-side lb-image-lightbox-side--prev"
          disabled={!hasPrev}
          aria-label="Previous image"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          <ChevronLeft size={22} {...lbIconProps()} />
        </button>
      )}

      <div className="lb-image-lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.url}
          alt={current.alt ?? 'Site photo'}
          className="lb-image-lightbox-img"
        />
      </div>

      {hasMultiple && (
        <button
          type="button"
          className="lb-image-lightbox-side lb-image-lightbox-side--next"
          disabled={!hasNext}
          aria-label="Next image"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          <ChevronRight size={22} {...lbIconProps()} />
        </button>
      )}

      <div className="lb-image-lightbox-footer" onClick={(e) => e.stopPropagation()}>
        {hasMultiple ? (
          <span className="lb-image-lightbox-count">
            {index + 1} / {images.length}
          </span>
        ) : null}
        <button
          type="button"
          className="lb-image-lightbox-download"
          onClick={() => downloadImage(current.url, imageFilename(current.url, index))}
        >
          <Download size={16} {...lbIconProps()} />
          Download
        </button>
      </div>
    </div>,
    document.body,
  );
}
