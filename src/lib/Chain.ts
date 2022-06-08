import Web3 from 'web3'
import { Provider } from './Wallet'
export class Chain {
    private context: Provider;
    private chainId: number = 0;
    constructor (context: Provider) {
        this.context = context;
    }

    async getNonce (address: string):Promise<number> {
        return this.context.web3.eth.getTransactionCount(address);
    }

    async getChainId() :Promise<number> {
        if (this.chainId === 0) {
            this.chainId = await this.context.web3.eth.getChainId();
        }
        return this.chainId;
    }
}