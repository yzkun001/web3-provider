# Web3 Provider -- yzkun


### How to use


```js

const { HttpProvider, WebsocketProvider } = require('y-web3-provider')

// or

import { HttpProvider, WebsocketProvider} from 'y-web3-provider'


// web3


const web3 = new Web3(new HttpProvider('rpc', 'privateKey'))


```


### v1.1.3

- 初始化providerKey参数改为可选，可以在使用中再倒入账户


- demo


```js
import { HttpProvider, WebsocketProvider} from 'y-web3-provider'

const web3 = new Web3(new HttpProvider(rpc))

// import account
//private
web3.currentProvider.addWalletFromPrivateKey(privateKey);
// keystote
web3.currentProvider.addWalletFromKeyStore(keyStore, passwd);


// remobe account

web3.currentProvider.removeWallet(address);


```