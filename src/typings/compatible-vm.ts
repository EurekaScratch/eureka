import type VM from 'scratch-vm';

export interface UnsupportedAPI {
  ScriptTreeGenerator?: {
    prototype: {
      descendInput: (this: any, block: VM.Block) => object;
    }
  }
}

export interface EurekaCompatibleVM extends VM {
  // Turbowarp only API
  exports?: {
    i_will_not_ask_for_help_when_these_break: () => UnsupportedAPI
    // PenguinMod proposed change
    ScriptTreeGenerator?: UnsupportedAPI['ScriptTreeGenerator']
  };
  ccExtensionManager?: {
      info: Record<
          string,
          {
              api: number;
          }
      >;
      getExtensionLoadOrder(extensions: string[]): unknown;
  };
  setLocale?: (locale: string, ...args: unknown[]) => unknown;
  getLocale?: () => string;
  _loadExtensions?: (
      extensionIDs: Set<string>,
      extensionURLs: Map<string, string>,
      ...args: unknown[]
  ) => Promise<unknown>;
}
