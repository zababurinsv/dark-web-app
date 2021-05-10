#  ▼ DarkBay - DarkDot Network DeCommerce Web UI

Darkdot is a set of Substrate pallets with web UI that allows anyone to launch their own decentralized censorship-resistant e-commerce shop aka storefront. 
Darkdot developers aim to bring a real decentralized and easy to use e-commerce system people may enjoy.
Darkdot chain aims to become a parachain and wishes to connect with other communities via Polkadot relay chain.

To learn more about Darkdot, please visit [Darkdot Network](http://darkdot.network).


## Video demo

![DarkBay preview](DarkDot-Github-Preview.gif)


## Run locally

If you want to develop Darkdot's web UI or just check it out locally, there is an easy way to do it.

Clone this repo:

```sh
git clone git@github.com:DarkPayCoin/dark-ui.git
cd dark-ui
```

Connect the app to Darkdot's server (Substrate node, IPFS):

```sh
cp darkdot-v2.env .env
```

Install project dependencies:

```sh
yarn
```

### Option A: Run in a DEV mode

A dev mode supports hot reloads – this is very helpful when developing UI bacuse you can see changes in your browser without restarting the app. But it takes some time (in seconds) compile updated parts of the app, after you made changes to the source code.

```sh
./run-dev.sh
```

Go to [localhost:3003](http://localhost:3003)

### Option B: Run in a PROD mode

A prod mode doesn't support hot reloads, but works super fast, because UI gets compiled by Next.js before running.

```sh
yarn build
yarn start
```

Go to [localhost:3003](http://localhost:3003)



## License

Darkdot is [GPL 3.0](./LICENSE) licensed.
