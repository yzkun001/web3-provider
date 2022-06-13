import Web3 from 'web3';
import type { KeyStore } from '../package/keythereum';
import { Chain } from './Chain';
/***
 * @name 钱包模块
 * @description 主要维护当前的 address/nonce，暂存私钥， 支持签名；
 * @author yzkun
 * 2022-06-08 17:07
 * * 希望新冠疫情快快退去
 */
export interface Provider {
    web3: Web3;
    config: any;
    chain: Chain;
}
export declare class Wallet {
    private accountMap;
    private nonceMap;
    private context;
    constructor(context: Provider, privateKey?: string);
    get address(): string[];
    addAccountFromKeyStore(store: KeyStore, passwd: string): void;
    addAccount(privateKey: string): void;
    removeAccount(address: string): boolean;
    getNonce(address: string): Promise<number>;
    signedTx(address: string, tx: any): Promise<string | undefined>;
    private updateNonce;
}
