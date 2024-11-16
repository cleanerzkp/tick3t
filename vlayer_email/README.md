Rust requirements:

RISC Zero in version 1.0.5
curl -L https://risczero.com/install | bash
rzup install cargo-risczero v1.0.5
cargo risczero install

```shell
$ forge build
```

```shell
$ cd vlayer
$ vlayer serve --rpc-url 11155111:https://rpc.sepolia.org
```

```shell
$ VLAYER_ENV=testnet bun run prove.ts
$ VLAYER_ENV=testnet bun run proveWithoutDeploy.ts
```
