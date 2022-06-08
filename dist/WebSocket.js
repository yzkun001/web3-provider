"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = void 0;
var Provider_1 = require("./lib/Provider");
var WebSocketProvider = /** @class */ (function (_super) {
    __extends(WebSocketProvider, _super);
    function WebSocketProvider(rpc, privateKey) {
        return _super.call(this, rpc, privateKey) || this;
    }
    return WebSocketProvider;
}(Provider_1.Provider));
exports.WebSocketProvider = WebSocketProvider;
