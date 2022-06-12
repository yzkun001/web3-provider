"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
var keythereum_1 = __importDefault(require("../package/keythereum"));
var Wallet = /** @class */ (function () {
    function Wallet(context, privateKey) {
        this.accountMap = new Map();
        this.nonceMap = new Map();
        this.context = context;
        if (privateKey) {
            this.addAccount(privateKey);
        }
    }
    ;
    Object.defineProperty(Wallet.prototype, "address", {
        get: function () {
            var accountArray = new Array();
            var mapIterator = this.accountMap.keys();
            var i = 0;
            while (i < this.accountMap.size) {
                accountArray.push(mapIterator.next().value);
                i++;
            }
            return accountArray;
        },
        enumerable: false,
        configurable: true
    });
    Wallet.prototype.addAccountFromKeyStore = function (store, passwd) {
        var privateyKey = '0x' + keythereum_1.default.recover(passwd, store).toString('hex');
        this.addAccount(privateyKey);
    };
    Wallet.prototype.addAccount = function (privateKey) {
        var account = this.context.web3.eth.accounts.privateKeyToAccount(privateKey);
        if (!this.accountMap.get(account.address)) {
            this.accountMap.set(account.address, account);
            this.nonceMap.set(account.address, { value: 0, time: 0 });
        }
    };
    Wallet.prototype.removeAccount = function (address) {
        return this.accountMap.delete(address) && this.nonceMap.delete(address);
    };
    Wallet.prototype.getNonce = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var chainId, accountNonce, prevTime, nonce, configTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.chain.getChainId()];
                    case 1:
                        chainId = (_a.sent()).toString();
                        accountNonce = this.nonceMap.get(address);
                        prevTime = accountNonce.time;
                        nonce = accountNonce.value;
                        configTime = this.context.config.block_time[chainId];
                        if (!(accountNonce.value === 0 || Date.now() - prevTime >= configTime)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.context.chain.getNonce(address)];
                    case 2:
                        nonce = _a.sent();
                        this.updateNonce(address, nonce);
                        _a.label = 3;
                    case 3: return [2 /*return*/, nonce];
                }
            });
        });
    };
    Wallet.prototype.signedTx = function (address, tx) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var account, signedTx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        account = this.accountMap.get(address);
                        return [4 /*yield*/, account.signTransaction(tx)];
                    case 1:
                        signedTx = _b.sent();
                        this.updateNonce(account.address, this.nonceMap.get(account.address).value + 1);
                        return [2 /*return*/, (_a = signedTx.rawTransaction) === null || _a === void 0 ? void 0 : _a.toString()];
                }
            });
        });
    };
    Wallet.prototype.updateNonce = function (address, nonce) {
        this.nonceMap.set(address, __assign(__assign({}, this.nonceMap.get(address)), { value: nonce }));
    };
    return Wallet;
}());
exports.Wallet = Wallet;
