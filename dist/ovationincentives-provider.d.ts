type OvationProviderOptions = {
    url: string;
    fetch: any;
    debug: boolean;
    entity: Record<string, Record<string, any>>;
    retry: {
        config: Record<string, any>;
    };
};
declare function OvationProvider(this: any, options: OvationProviderOptions): {
    exports: {
        sdk: () => null;
    };
};
export default OvationProvider;
