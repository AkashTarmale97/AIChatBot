declare module 'dom-to-image-more' {
  interface Options {
    width?: number;
    height?: number;
    style?: { [key: string]: string };
    cacheBust?: boolean;
    [key: string]: any;
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  // Add other exports if you use them
}
