import Web3 from 'web3';
import { Chain } from './Chain';
import { KeyStore } from '../package/keythereum';
interface dataParams {
    id: string | number;
    jsonrpc: string;
    method: string;
    params: any[];
}
interface RequestArguments {
    method: string;
    params?: any;
    [key: string]: any;
}
interface responseData {
    jsonrpc: string;
    id: number | string;
    result: any;
    error?: any;
}
export declare class Provider {
    private wallet;
    private originSendFunc;
    chain: Chain;
    web3: Web3;
    config: {
        block_time: {
            '1': number;
            '4': number;
            '56': number;
            '97': number;
            '128': number;
            '256': number;
        };
    };
    private callbacks;
    private nonceWait;
    private promiseWait;
    constructor(rpc: string, privatekey?: string);
    send(data: dataParams, callback: Function): void;
    request(data: RequestArguments): Promise<any>;
    addWalletFromPrivateKey(privateKey: string): void;
    addWalletFromKeyStore(keyStore: KeyStore, passwd: string): void;
    removeWallet(address: string): boolean;
    sendAsync(data: dataParams, callback: (error: Error | null, result?: responseData) => void): void;
    private getNonce;
    private chainId;
    private sendTransaction;
    private sendRequest;
    private wrapResponse;
    private response;
}
export {};
