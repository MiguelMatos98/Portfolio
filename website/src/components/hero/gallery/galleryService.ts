export interface GalleryAction {
  label: string;
  href: string;
}

export interface GallerySlide {
  image: string;
  alt?: string;
  title: string;
  description?: string;
  href?: string;
  actions?: GalleryAction[];
}

export interface GalleryConfig {
  radius?: number;
  buttonWidth?: number;
  transitionDuration?: number;
  dragThreshold?: number;
  completionThreshold?: number;
}

export const defaultConfig: Required<GalleryConfig> = {
  radius: 2,
  buttonWidth: 4,
  transitionDuration: 0.6,
  dragThreshold: 5,
  completionThreshold: 0.4,
};

export function generateGridTemplate(
  totalSlides: number,
  activeIndex: number,
  expandRatio = 20
): string {
  return Array.from({ length: totalSlides })
    .map((_, i) => (i === activeIndex ? `${expandRatio}fr` : '1fr'))
    .join(' ');
}

export function interpolateGridTemplate(
  totalSlides: number,
  activeIndex: number,
  targetIndex: number,
  progress: number,
  maxExpand = 20
): string {
  const sizes = Array(totalSlides).fill(1);
  const expandAmount = (maxExpand - 1) * progress;

  sizes[activeIndex] = Math.max(1, maxExpand - expandAmount);
  sizes[targetIndex] = 1 + expandAmount;

  return sizes.map((s) => `${s}fr`).join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getNextIndex(
  current: number,
  total: number,
  direction: 'next' | 'prev'
): number {
  if (direction === 'next') {
    return current >= total - 1 ? 0 : current + 1;
  }
  return current <= 0 ? total - 1 : current - 1;
}

export const defaultSlides: GallerySlide[] = [
  {
    image:
      'https://fastly.picsum.photos/id/1023/1920/1080.jpg?hmac=rlsKP6YbqSnw8h-HfW2RCyu3MKkG90hNhLsOsEuGXj8',
    title: 'Timeless bags and modular kits designed for life in motion',
    actions: [
      { label: 'Shop Luggage', href: '#' },
      { label: 'Shop Bags', href: '#' },
    ],
  },
  {
    image:
      'https://fastly.picsum.photos/id/685/1920/1080.jpg?hmac=GjjlhGiZFP-hXkJ4S2r2UwMqVqeBH6ky7FAe3DTgrmg',
    title: 'Sustainable, innovative design for conscious travelers',
    actions: [
      { label: 'Explore Collection', href: '#' },
      { label: 'Learn More', href: '#' },
    ],
  },
  {
    image:
      'https://fastly.picsum.photos/id/633/1920/1080.jpg?hmac=bihVvHUhsF_TR3itiDFvktbq0otiU7aaK2tj8JIiv6Y',
    title: 'Crafted for adventure, built to last a lifetime of exploration',
    actions: [
      { label: 'Shop Adventure', href: '#' },
      { label: 'View Stories', href: '#' },
    ],
  },
  {
    image:
      'https://fastly.picsum.photos/id/484/1920/1080.jpg?hmac=vmcAj5Ko9XuMClDpoG0f71EbsLLyC70juc3xi9cGnNU',
    title: 'Minimalist elegance meets maximum functionality for modern nomads',
    actions: [
      { label: 'View Collection', href: '#' },
      { label: 'Get Inspired', href: '#' },
    ],
  },
];

export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const easeConfig = {
  type: 'tween' as const,
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.6,
};
