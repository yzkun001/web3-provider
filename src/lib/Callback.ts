export class CallbackControll {
    private callback: any = {};
    public pushCallback(id: string, cb: Function) :void {
        this.callback[id] = cb;
    }
    public emit(id: string, data: any, error: any) :void {
        if (!this.callback[id]) throw new Error('unknow params [id]');   
        this.callback[id](error, data);
        delete this.callback[id];
    }
}