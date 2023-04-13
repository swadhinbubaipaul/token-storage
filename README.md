# Token Storage

## Guide:

1. Depositor first runs the approve function to give spending permission to TestToken contract
2. Then depositor executes deposit function to deposit the tokens.
3. After deposit, the depositor can check his slab number.
4. When the depositor wants to withdraw the fund, he executes the withdraw function.

## Decisions:

1. The deposit function takes a token address and an amount as input, and transfers the token from the depositor to the contract using the transferFrom function.

2. The withdraw function takes a token address and an amount. It checks that the slab has sufficient balance to cover the withdrawal. It then subtracts the balance and transfers the token to the depositor using the transfer function.

3. The getSlab function takes a token address and returns the index of slab, or reverts if no slab found.

## Deployed contracts to mumbai testnet:

1. TestToken: 0xc7Dc20f559325acab9eB63C2462dB1B8c47dD461
2. TokenStorage: 0x76e628c9144c7852aBd4ba3A1560C300ad19a6CA
