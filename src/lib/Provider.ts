import Web3 from 'web3'
import type { provider } from 'web3-core'
import { Wallet } from './Wallet'
import { Chain } from './Chain'
import { config } from './Config'
import { CallbackControll } from './Callback'

interface dataParams {
    id: string | number,
    jsonrpc: string,
    method: string,
    params: any[]
}


interface responseData {
    jsonrpc: string,
    id: number | string,
    result: any
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

    constructor (rpc: string, privatekey: string) {
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
        this.wallet = new Wallet(privatekey, this);
        this.chain = new Chain(this);
    }
    public send (data: dataParams, callback: Function) {
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
            default:
                this.sendRequest(data);
                break;
        }
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
        this.originSendFunc(data, (err: any, res: responseData | null) => {
            this.response(data.id, res, err)
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

