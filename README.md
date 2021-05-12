![](https://darkdot.network/sites/default/files/2021-02/dark-dot-token-banner-d4rk-news.png)

# ▼ DARK DOT 

This repository holds development code for DARK parachain built with Substrate.


Purpose
=============
Born in 2018, Dark is a community funded project which aims to provide a DAO governed, decentralized p2p e-commerce network.
Usage fees are collected in Treasury account, and used to reward users and stakers regularly, and  funding appoved proposals.
An automated escrow layer while ordering and a reputation system prevent users from having bad behavior.

Features
=============
Features implementation can be found  in the /pallets folder.
- [x] Profiles
- [x] Storefronts
- [x] Products
- [x] Orders
- [x] Escrow system
- [x] Reputation
- [x] Fiat prices via offchain worker
- [x] IPFS storage & cluster

Every user can create one or several storefronts, and create products in it. Users can then order these product, and pay in tokens according to the conversion rate given by offchain worker.

More features are planned and being developped : storefront ownership transfer & multi-ownership, inventory management, and more !


Escrow system & order flow
=============
Order flow and funds locking are managed by blockchain logic (found in /pallets/orderings folder).
An escrow system locks a per-product configurable buyer & seller escrow (= a % of product price), depending of order state and user action.
To make it short : scammers loose their funds and enrich the DAO Treasury account.

```flow
st=>start: Buyer creates order
op=>operation:  Buyer funds locked
cond=>condition: Seller accepts order?
slock=>operation: Seller funds locked
ful=>operation: Buyer funds un:ocked
arrcond=>condition: Buyer & seller solve the issue

ssend=>operation: Order is shipped & seller marks order as sent
complete=>operation: Order is complete, both escrow funds unlocked
notcomplete=>operation: Order is not marked as complete
dispute=>operation: Both funds are retained by Treasury account. User may use dispute mode (DAO arbitrage)

delivcond=>condition: Order is received and conform

st->op->cond
cond(yes)->slock
cond(no)->ful

slock->ssend->delivcond
delivcond(yes)->complete
delivcond(no)->notcomplete

slock->ssend->delivcond(no)->arrcond
arrcond(yes)->complete
arrcond(no)->dispute

```


Chain metrics
=============
As a Substrate port of legacy D4RK blockchain, last metrics voted by community will be applied.
Basic chain params are enhanced thanks to Substrate (i.e: block time target = 6 seconds).

### DARK token

| Item      | Value |
| --------- | -----:|
| Token  | DARK |
| SS58 prefix    |  17 |
| Decimals     |   12 |
| Block Time     |   6s |

### Staking rewards/inflation curve

|  june 2020 | june 2021 | june 2022 |june 2023 |june 2024 |june 2025 |june 2026 |june 2027
| :------------ |:---------------:| -----:|
| 18.00%    | 15.00% | 13.00% | 5.00% |5.00% |2.50% |2.50% |2.00% |
Inflation & rewards decrease yearly as voted by community in 2019

Setup & run
=============

## Local Development

Follow these steps to prepare a local Substrate development environment :hammer_and_wrench:

### Simple Setup

Install all the required dependencies with a single command (be patient, this can take up to 30
minutes).

```bash
curl https://getsubstrate.io -sSf | bash -s -- --fast
```

### Manual Setup

Find manual setup instructions at the
[Substrate Developer Hub](https://substrate.dev/docs/en/knowledgebase/getting-started/#manual-installation).

### Build

Once the development environment is set up, build the node template. This command will build the
[Wasm](https://substrate.dev/docs/en/knowledgebase/advanced/executor#wasm-execution) and
[native](https://substrate.dev/docs/en/knowledgebase/advanced/executor#native-execution) code:

```bash
cargo build --release
```

## Run

### Single Node Development Chain

Purge any existing dev chain state:

```bash
./target/release/dark-node purge-chain --dev
```

Start a dev chain:

```bash
./target/release/dark-node --dev
```

Or, start a dev chain with detailed logging:

```bash
RUST_LOG=debug RUST_BACKTRACE=1 ./target/release/dark-node -lruntime=debug --dev
```

### Multi-Node Local Testnet

If you want to see the multi-node consensus algorithm in action, refer to
[our Start a Private Network tutorial](https://substrate.dev/docs/en/tutorials/start-a-private-network/).

Credits
=============
To avoid reinventing the wheel, we forked te great [Subsocial](https://subsocial.network/) project as a development basis. We learnt a lot about Substrate thanks to their very professional work. Kudos to their team.
