declare module 'asciinema-player' {
  export interface AsciinemaPlayerOptions {
    autoplay?: boolean;
    loop?: boolean;
    preload?: boolean;
    theme?: 'asciinema' | 'solarized-light' | 'solarized-dark';
    speed?: number;
    idleTimeLimit?: number;
    poster?: string | null;
    rows?: number;
    cols?: number;
    fit?: 'width' | 'height' | 'both' | 'none' | boolean;
    controls?: boolean;
    terminalFontSize?: string;
  }

  export interface AsciinemaPlayer {
    dispose(): void;
  }

  export function create(src: string, element: HTMLElement, options?: AsciinemaPlayerOptions): AsciinemaPlayer;
}
