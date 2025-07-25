export declare global {
  interface CustomEventMap {
    nav: CustomEvent<{ url: URL }>
    prenav: CustomEvent<{}>
    themechange: CustomEvent<{ theme: string }>
    readermodechange: CustomEvent<{ mode: string }>
  }

  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K] | UIEvent): void
  }
  interface Window {
    spaNavigate(url: URL, isBack: boolean = false)
    addCleanup(fn: (...args: any[]) => void)
    fetchData: Promise<Record<string, any>>
  }
}
