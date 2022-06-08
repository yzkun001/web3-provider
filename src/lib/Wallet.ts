import Web3 from 'web3'
import type { Account  } from 'web3-core'
import { Chain } from './Chain';
import { config } from './Config';

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

export class Wallet {
    private nonce: {value: number, time: number} = {value: 0, time: 0};
    private account: Account;
    private context: Provider;
    constructor (privateKey: string, context: Provider) {
        this.context = context;
        this.account = this.context.web3.eth.accounts.privateKeyToAccount(privateKey);
    }

    get address () :string {
        return this.account.address;
    }

    public async getNonce () {
        const chainId: string = (await this.context.chain.getChainId()).toString();
        // 检查nonce
        let prevTime: number = this.nonce.time;
        const configTime: number = this.context.config.block_time[chainId];
        if (this.nonce.value === 0 || Date.now() - prevTime >= configTime) {
            // update
            this.updateNonce(await this.context.chain.getNonce(this.account.address));
        }
        return this.nonce.value;
    }

    public async signedTx(tx: any) :Promise<string | undefined> {
        const signedTx = await this.account.signTransaction(tx)
        this.updateNonce(this.nonce.value + 1)
        return signedTx.rawTransaction?.toString()
    }

    private updateNonce (nonce :number) :void {
        this.nonce = {
            value: nonce,
            time: Date.now()
        }
    }
    
}