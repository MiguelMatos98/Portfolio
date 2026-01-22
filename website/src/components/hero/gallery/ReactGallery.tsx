import { useState, useCallback, useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from 'framer-motion';
import {
  type GallerySlide,
  type GalleryConfig,
  defaultConfig,
  defaultSlides,
  generateGridTemplate,
  getNextIndex,
  springConfig,
} from './galleryService';

interface ReactGalleryProps {
  slides?: GallerySlide[];
  config?: GalleryConfig;
  className?: string;
  basePath?: string;
}

export default function ReactGallery({
  slides = defaultSlides,
  config: userConfig,
  className = '',
  basePath = '',
}: ReactGalleryProps) {
  const config = { ...defaultConfig, ...userConfig };
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragX = useMotionValue(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setActiveIndex((prev) => getNextIndex(prev, slides.length, 'prev'));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setActiveIndex((prev) => getNextIndex(prev, slides.length, 'next'));
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(slides.length - 1);
          break;
        case 'Enter':
          e.preventDefault();
          const activeSlide = slides[activeIndex];
          if (activeSlide?.href) {
            window.location.href = basePath + activeSlide.href;
          }
          break;
      }
    },
    [slides, activeIndex, basePath]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const threshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
        if (offset < 0 || velocity < -500) {
          setActiveIndex((prev) => getNextIndex(prev, slides.length, 'next'));
        } else {
          setActiveIndex((prev) => getNextIndex(prev, slides.length, 'prev'));
        }
      }

      animate(dragX, 0, springConfig);
    },
    [slides.length, dragX]
  );

  const handleTabClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleSlideClick = useCallback(
    (slide: GallerySlide, index: number) => {
      if (index !== activeIndex) {
        setActiveIndex(index);
        return;
      }
      if (slide.href && !isDragging) {
        window.location.href = basePath + slide.href;
      }
    },
    [activeIndex, isDragging, basePath]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (document.activeElement === containerRef.current) {
          return;
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const gridTemplate = generateGridTemplate(slides.length, activeIndex);

  return (
    <div
      ref={containerRef}
      className={`gallery-container ${className}`}
      role="region"
      aria-label="Project gallery"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-dragging={isDragging || undefined}
    >
      <style>{`
        .gallery-container {
          --radius: ${config.radius}rem;
          --button-width: ${config.buttonWidth}rem;
          --transition-duration: ${config.transitionDuration}s;
          --total-slides: ${slides.length};

          /* Starlight color integration */
          --gallery-accent: var(--sl-color-accent, hsl(330 80% 60%));
          --gallery-accent-high: var(--sl-color-accent-high, hsl(330 80% 70%));
          --gallery-bg: var(--sl-color-bg, hsl(0 0% 5%));
          --gallery-text: var(--sl-color-text, hsl(0 0% 100%));
          --gallery-text-accent: var(--sl-color-text-accent, hsl(330 80% 90%));
          --gallery-border: var(--sl-color-gray-5, hsl(0 0% 20%));

          position: relative;
          width: 100%;
          height: 100%;
          border-radius: var(--radius);
          overflow: hidden;
          outline: none;
          container-type: inline-size;
          touch-action: pan-y pinch-zoom;
          background: var(--gallery-bg);
        }

        .gallery-container:focus-visible {
          outline: 2px solid var(--gallery-accent);
          outline-offset: 2px;
        }

        .gallery-container[data-dragging] {
          cursor: grabbing;
        }

        .gallery-tablist {
          display: grid;
          grid-template-columns: ${gridTemplate};
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          transition: grid-template-columns var(--transition-duration) cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .gallery-tab {
          width: var(--button-width);
          height: 100%;
          pointer-events: all;
          background: transparent;
          border: none;
          cursor: grab;
          opacity: 0;
          padding: 0;
        }

        .gallery-tab[aria-selected="true"] {
          cursor: default;
        }

        .gallery-tab:focus-visible {
          opacity: 1;
          outline: 2px solid var(--gallery-accent);
          outline-offset: -4px;
        }

        .gallery-panels {
          display: grid;
          grid-template-columns: ${gridTemplate};
          height: 100%;
          transition: grid-template-columns var(--transition-duration) cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .gallery-container[data-dragging] .gallery-panels,
        .gallery-container[data-dragging] .gallery-tablist {
          transition: none;
        }

        .gallery-panel {
          position: relative;
          height: 100%;
          min-width: var(--button-width);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .gallery-panel-content {
          position: absolute;
          inset: 0;
          right: 0;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--gallery-border);
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .gallery-panel[data-active="true"] .gallery-panel-content:hover {
          border-color: var(--gallery-accent);
        }

        .gallery-panel:first-child .gallery-panel-content {
          width: calc(100cqi - ((var(--total-slides) - 1) * var(--button-width)));
        }

        .gallery-panel:not(:first-child) .gallery-panel-content {
          width: calc(100cqi - ((var(--total-slides) - 1) * var(--button-width)) + (var(--radius) * 2));
        }

        .gallery-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-panel[data-active="true"]:hover .gallery-image {
          transform: scale(1.02);
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            transparent 30%,
            hsl(0 0% 0% / 0.4) 50%,
            hsl(0 0% 0% / 0.85)
          );
          display: flex;
          align-items: flex-end;
          padding: 2rem;
        }

        .gallery-panel:not(:first-child) .gallery-overlay {
          padding-left: calc(var(--radius) * 2 + 2rem);
        }

        .gallery-text {
          color: var(--gallery-text);
          max-width: 85%;
          opacity: 0;
          transform: translateY(1rem);
          transition: opacity 0.4s ease, transform 0.4s ease;
          transition-delay: 0s;
        }

        .gallery-panel[data-active="true"] .gallery-text {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.3s;
        }

        .gallery-title {
          font-size: clamp(1.5rem, 5cqi, 3rem);
          font-weight: 600;
          line-height: 1.1;
          margin: 0 0 0.5rem;
          text-wrap: balance;
          color: var(--gallery-text);
        }

        .gallery-description {
          font-size: clamp(0.875rem, 2cqi, 1.125rem);
          font-weight: 400;
          line-height: 1.4;
          margin: 0 0 1.25rem;
          opacity: 0.85;
          max-width: 600px;
        }

        .gallery-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .gallery-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 2px solid var(--gallery-accent);
          border-radius: 0.5rem;
          color: var(--gallery-text);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          background: transparent;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }

        .gallery-action:hover,
        .gallery-action:focus-visible {
          background: var(--gallery-accent);
          color: var(--gallery-bg);
          transform: translateY(-2px);
        }

        .gallery-action--primary {
          background: var(--gallery-accent);
          color: var(--gallery-bg);
        }

        .gallery-action--primary:hover,
        .gallery-action--primary:focus-visible {
          background: var(--gallery-accent-high);
        }

        .gallery-link-hint {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gallery-link-hint svg {
          width: 1em;
          height: 1em;
        }

        @container (max-width: 500px) {
          .gallery-tablist {
            grid-template-columns: 1fr;
            grid-template-rows: ${gridTemplate};
          }

          .gallery-tab {
            width: 100%;
            height: var(--button-width);
          }

          .gallery-panels {
            grid-template-columns: 1fr;
            grid-template-rows: ${gridTemplate};
          }

          .gallery-panel {
            min-height: var(--button-width);
            min-width: unset;
          }

          .gallery-panel-content {
            width: 100% !important;
            height: calc(100cqh - ((var(--total-slides) - 1) * var(--button-width)));
          }

          .gallery-panel:not(:first-child) .gallery-panel-content {
            height: calc(100cqh - ((var(--total-slides) - 1) * var(--button-width)) + (var(--radius) * 2));
          }

          .gallery-overlay {
            padding: 1.5rem;
          }

          .gallery-panel:not(:first-child) .gallery-overlay {
            padding-left: 1.5rem;
            padding-top: calc(var(--radius) * 2 + 1.5rem);
          }

          .gallery-text {
            max-width: 100%;
          }

          .gallery-description {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-panels,
          .gallery-tablist,
          .gallery-text,
          .gallery-image {
            transition: none;
          }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>

      <div className="gallery-tablist" role="tablist" aria-label="Gallery slides">
        {slides.map((_, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: index === 0 ? 'flex-start' : 'flex-end' }}>
            <button
              role="tab"
              className="gallery-tab"
              aria-selected={index === activeIndex}
              aria-controls={`panel-${index}`}
              id={`tab-${index}`}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => handleTabClick(index)}
            >
              <span className="sr-only">Slide {index + 1}: {slides[index].title}</span>
            </button>
          </div>
        ))}
      </div>

      <motion.div
        className="gallery-panels"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            role="tabpanel"
            className="gallery-panel"
            id={`panel-${index}`}
            aria-labelledby={`tab-${index}`}
            data-active={index === activeIndex}
            style={{
              zIndex: slides.length - index,
              '--index': index
            } as React.CSSProperties}
            inert={index !== activeIndex ? true : undefined}
          >
            <div
              className="gallery-panel-content"
              onClick={() => handleSlideClick(slide, index)}
              role={slide.href ? 'link' : undefined}
              aria-label={slide.href ? `View ${slide.title}` : undefined}
            >
              <img
                src={slide.image}
                alt={slide.alt || slide.title}
                className="gallery-image"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="gallery-overlay">
                <div className="gallery-text">
                  <h2 className="gallery-title">{slide.title}</h2>
                  {slide.description && (
                    <p className="gallery-description">{slide.description}</p>
                  )}
                  {slide.actions && slide.actions.length > 0 && (
                    <div className="gallery-actions">
                      {slide.actions.map((action, actionIndex) => (
                        <a
                          key={actionIndex}
                          href={basePath + action.href}
                          className={`gallery-action ${actionIndex === 0 ? 'gallery-action--primary' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {slide.href && !slide.actions?.length && (
                    <span className="gallery-link-hint">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      Click to view project
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <span className="sr-only" aria-live="polite">
        Showing slide {activeIndex + 1} of {slides.length}: {slides[activeIndex]?.title}
      </span>
    </div>
  );
}
