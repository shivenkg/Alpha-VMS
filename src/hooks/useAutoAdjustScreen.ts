import { useState, useEffect, useCallback } from 'react';

export type ScreenBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

export interface ViewportScreenState {
  width: number;
  height: number;
  breakpoint: ScreenBreakpoint;
  isCompact: boolean; // width < 1024px
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
}

const getBreakpoint = (width: number): ScreenBreakpoint => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1536) return 'desktop';
  return 'ultrawide';
};

const getScreenState = (): ViewportScreenState => {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      breakpoint: 'desktop',
      isCompact: false,
      aspectRatio: 1.6,
      orientation: 'landscape',
    };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    breakpoint: getBreakpoint(width),
    isCompact: width < 1024,
    aspectRatio: width / (height || 1),
    orientation: width >= height ? 'landscape' : 'portrait',
  };
};

interface UseAutoAdjustScreenOptions {
  onScreenChange?: (state: ViewportScreenState) => void;
  autoCollapseSidebarThreshold?: number; // e.g. 1024px
  onAutoCollapseSidebar?: () => void;
}

/**
 * Enterprise Viewport Auto-Adjust & Auto-Render Hook
 * Automatically detects screen size variations, adjusts layouts,
 * triggers responsive render refits, and unpins/collapses persistent sidebars
 * on compact viewports to ensure the main screen remains center-aligned.
 */
export const useAutoAdjustScreen = ({
  onScreenChange,
  autoCollapseSidebarThreshold = 1024,
  onAutoCollapseSidebar,
}: UseAutoAdjustScreenOptions = {}) => {
  const [screenState, setScreenState] = useState<ViewportScreenState>(getScreenState);
  const [resizeSequence, setResizeSequence] = useState(0);

  const handleResize = useCallback(() => {
    const nextState = getScreenState();
    setScreenState(nextState);
    setResizeSequence((prev) => prev + 1);

    if (onScreenChange) {
      onScreenChange(nextState);
    }

    // Auto-adjust: If screen shrank below tablet/compact threshold, automatically collapse pinned sidebar
    if (nextState.width < autoCollapseSidebarThreshold && onAutoCollapseSidebar) {
      onAutoCollapseSidebar();
    }
  }, [autoCollapseSidebarThreshold, onAutoCollapseSidebar, onScreenChange]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const onWindowResize = () => {
      // Debounced frame update for smooth layout reflow
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleResize();
      }, 50);
    };

    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('orientationchange', onWindowResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('orientationchange', onWindowResize);
    };
  }, [handleResize]);

  return {
    ...screenState,
    resizeSequence,
    triggerAutoRender: handleResize,
  };
};
