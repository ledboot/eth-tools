# eth-tools

## Usage

```bash
yarn install
```

### transfer.js

current support transfer eth and erc20，many address to one.

Before use, you need to set the `TO_ADDRESS` and `ALCHEMY_RPC_URL` in the .env file.

And set all private keys in the `pk.txt` file, one per line.

```bash
node transfer.js
```
### generateAccount.js

generate account and private key.

one command generate 1 accounts in `account.txt` file.
next command account info will be append to `account.txt` file.

```bash
node generateAccount.js
```
