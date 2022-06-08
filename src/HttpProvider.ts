import { Provider } from "./lib/Provider";

export class HttpProvider extends Provider {
    constructor (rpc: string, privateKey: string) {
        super(rpc, privateKey);
    }
}