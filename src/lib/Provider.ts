import Web3 from 'web3'
import type { provider } from 'web3-core'
import { Wallet } from './Wallet'
import { Chain } from './Chain'
import config from './Config'
import { CallbackControll } from './Callback'
import { KeyStore } from '../package/keythereum'

interface dataParams {
    id: string | number,
    jsonrpc: string,
    method: string,
    params: any[]
}

interface RequestArguments {
    method: string;
    params?: any;
    [key: string]: any;
}


interface responseData {
    jsonrpc: string,
    id: number | string,
    result: any,
    error?: any
}

export class Provider {
    private wallet: Wallet;
    private originSendFunc: Function;
    public chain: Chain;
    public web3: Web3;
    public config = config;
    private callbacks: CallbackControll = new CallbackControll();
    private nonceWait: boolean = false;
    private promiseWait: any[] = [];

    constructor (rpc: string, privatekey?: string) {
        let originProvider: provider;
        if (/^http/.test(rpc)) {
            originProvider = new Web3.providers.HttpProvider(rpc);
        } else if (/^ws/.test(rpc)) {
            originProvider = new Web3.providers.WebsocketProvider(rpc);
        } else {
            throw new Error('rpc invalid')
        }
        this.originSendFunc = originProvider.send.bind(originProvider);
        this.web3 = new Web3(originProvider);
        this.wallet = new Wallet(this, privatekey);
        this.chain = new Chain(this);
    }
    public send (data: dataParams, callback: Function) :void {
        this.callbacks.pushCallback(data.id.toString(), callback)
        switch (data.method) {
            case 'net_version':
            case 'eth_chainId':
                this.chainId(data);
                break;
            case 'eth_accounts':
                this.response(data.id, this.wrapResponse(data, this.wallet.address));
                break;
            case 'eth_sendTransaction':
                this.sendTransaction(data);
                break;
            case 'eth_getTransactionCount':
                this.getNonce(data);
                break;
            default:
                this.sendRequest(data);
                break;
        }
    }

    public request(data: RequestArguments):Promise<any> {
        return new Promise((resolve, reject) => {
            this.send(<dataParams>{
                id: Date.now(),
                method: data.method,
                params: data.params
            }, (err: any, result: responseData | null) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result?.result)
                }
            })
        })
    }

    public addWalletFromPrivateKey(privateKey: string):void {
        this.wallet.addAccount(privateKey);
    }

    public addWalletFromKeyStore(keyStore: KeyStore, passwd: string): void {
        this.wallet.addAccountFromKeyStore(keyStore, passwd);
    }

    public removeWallet(address: string) :boolean {
        return this.wallet.removeAccount(address);
    }

    public sendAsync (data: dataParams, callback: (error: Error | null, result?: responseData) => void):void {
        this.send(data, callback)
    }

    private async getNonce(data: dataParams) :Promise<void> {
        this.response(data.id, this.wrapResponse(data, await this.wallet.getNonce(data.params[0])))
    }

    private async chainId (data: dataParams) {
        this.response(data.id, this.wrapResponse(data, await this.chain.getChainId()))
    }

    private async sendTransaction (data: dataParams) {
        // wait sign
        if (this.nonceWait) {
            let promise = new Promise((resolve, reject) => {
                this.promiseWait.push(resolve)
            })
            await promise;
        }
        this.nonceWait = true;
        try {
            const tx = data.params[0];
            if (!tx.from) {
                throw('tx from invalid')
            }
            const nonce = await this.wallet.getNonce(tx.from);
            tx.nonce = '0x' + parseInt(nonce + '').toString(16)
            if (!tx.gas) {
                tx.gas = (await this.request({
                    method: 'eth_estimateGas',
                    params: [tx]
                })) * 1.5;
            }
            const txSigned = await this.wallet.signedTx(tx.from,tx)
            this.sendRequest({
                id: data.id,
                jsonrpc: '2.0',
                method: 'eth_sendRawTransaction',
                params: [txSigned]
            })
        } catch (error) {
            this.response(data.id, null, error)
        }
        const cb = this.promiseWait.shift();
        if (cb) {
            cb();
        } else {
            this.nonceWait = false;
        }
    }

    private sendRequest (data: dataParams) {
        this.originSendFunc(data, (err:
             any, res: responseData | null) => {
            this.response(data.id, res, err || res?.error)
        })
    }

    private wrapResponse(data: dataParams, result: any) :responseData {
        return {
            jsonrpc: '2.0',
            id: data.id,
            result: result
        }
    }

    private response (id: string | number, responseData: responseData | null, error?:any) :void {
        this.callbacks.emit(id.toString(), responseData, error)
    }
}

