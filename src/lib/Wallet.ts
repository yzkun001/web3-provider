import Web3 from 'web3'
import keythereum from '../package/keythereum'
import type { KeyStore } from '../package/keythereum'
// import type { store } from 'keythereum'
import type { Account  } from 'web3-core'
import { Chain } from './Chain';

/***
 * @name 钱包模块
 * @description 主要维护当前的 address/nonce，暂存私钥， 支持签名；
 * @author yzkun
 * 2022-06-08 17:07
 * * 希望新冠疫情快快退去
 */

export interface Provider {
    web3: Web3,
    config: any
    chain: Chain
}

interface nonceDataModel {
    value: number;
    time: number;
}

export class Wallet {
    private accountMap: Map<string, Account> = new Map();;
    private nonceMap: Map<string, nonceDataModel> = new Map();
    private context: Provider;
    constructor (context: Provider, privateKey?: string, ) {
        this.context = context;
        if (privateKey) {
            this.addAccount(privateKey);
        }
    }

    get address () :string[] {
        let accountArray: string[] = new Array();
        const mapIterator: IterableIterator<string> = this.accountMap.keys()
        let i = 0;
        while (i < this.accountMap.size) {
            accountArray.push(mapIterator.next().value);
            i++;
        }
        return accountArray;
    }

    public addAccountFromKeyStore(store: KeyStore, passwd: string) :void {
        const privateyKey: string = '0x' + keythereum.recover(passwd, store).toString('hex')
        this.addAccount(privateyKey);
    }

    public addAccount(privateKey: string) :void {
        let account = this.context.web3.eth.accounts.privateKeyToAccount(privateKey);
        if (!this.accountMap.get(account.address)) {
            this.accountMap.set(account.address, account)
            this.nonceMap.set(account.address, {value: 0, time: 0})
        }
    }

    public removeAccount(address: string) :boolean {
        return this.accountMap.delete(address) && this.nonceMap.delete(address);
    }

    public async getNonce (address: string) {
        const chainId: string = (await this.context.chain.getChainId()).toString();
        // 检查nonce
        const accountNonce: nonceDataModel = <nonceDataModel>this.nonceMap.get(address);
        let prevTime: number = accountNonce.time;
        let nonce = accountNonce.value;
        const configTime: number = this.context.config.block_time[chainId];
        if (accountNonce.value === 0 || Date.now() - prevTime >= configTime) {
            nonce = await this.context.chain.getNonce(address)
            this.updateNonce(address, nonce);
        }
        return nonce;
    }

    public async signedTx(address: string, tx: any) :Promise<string | undefined> {
        let account: Account = <Account>this.accountMap.get(address);
        const signedTx = await account.signTransaction(tx)
        this.updateNonce(account.address, (<nonceDataModel>this.nonceMap.get(account.address)).value + 1)
        return signedTx.rawTransaction?.toString()
    }

    private updateNonce (address: string, nonce :number) :void {
        this.nonceMap.set(address, {
            ...<nonceDataModel>this.nonceMap.get(address),
            value: nonce
        })
    }
    
}