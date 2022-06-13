import { Provider } from './Wallet';
export declare class Chain {
    private context;
    private chainId;
    constructor(context: Provider);
    getNonce(address: string): Promise<number>;
    getChainId(): Promise<number>;
}
