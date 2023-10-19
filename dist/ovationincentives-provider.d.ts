type OvationProviderOptions = {
    url: string;
    authurl: string;
    proxyurl: string;
    proxysecret: string;
    fetch: any;
    debug: boolean;
    live: boolean;
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
