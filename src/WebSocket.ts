import { Provider } from "./lib/Provider";

export class WebSocketProvider extends Provider {
    constructor (rpc: string, privateKey?: string) {
        super(rpc, privateKey);
    }
}