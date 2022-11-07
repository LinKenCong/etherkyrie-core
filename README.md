# EtherKyrie

This repository contains the core smart contracts for the EtherKyrie Protocol.

## Notice

The project is still in development version.

Maybe not fully functional.

## Local deployment

Installing dependencies

```
yarn install
```

Compile contracts

```
yarn compile
```

Run hardhat Network

```
npx hardhat node
```

Test contracts

```
yarn test
# test specified file
npx hardhat test test/xxx.ts
# specified test network
npx hardhat test --network xxx
```

Deploy contract

```
npx hardhat run scripts/deploy.ts --network xxx
```

Generate the code coverage report

```
npx hardhat coverage
```
