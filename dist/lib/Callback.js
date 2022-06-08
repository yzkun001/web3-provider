"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackControll = void 0;
var CallbackControll = /** @class */ (function () {
    function CallbackControll() {
        this.callback = {};
    }
    CallbackControll.prototype.pushCallback = function (id, cb) {
        this.callback[id] = cb;
    };
    CallbackControll.prototype.emit = function (id, data, error) {
        if (!this.callback[id])
            throw new Error('unknow params [id]');
        this.callback[id](error, data);
        delete this.callback[id];
    };
    return CallbackControll;
}());
exports.CallbackControll = CallbackControll;
