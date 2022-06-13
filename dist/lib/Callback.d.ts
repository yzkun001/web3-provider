export declare class CallbackControll {
    private callback;
    pushCallback(id: string, cb: Function): void;
    emit(id: string, data: any, error: any): void;
}
