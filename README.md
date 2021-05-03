# Darkdot DeCommerce Web UI

Darkdot is a set of Substrate pallets with web UI that allows anyone to launch their own decentralized censorship-resistant e-commerce shop aka storefront. 
Darkdot developers aim to bring a real decentralized and easy to use e-commerce system people may enjoy.
Darkdot chain aims to become a parachain and wishes to connect with other communities via Polkadot relay chain.

To learn more about Darkdot, please visit [Darkdot Network](http://darkdot.network).

## Video demo

Incoming

## Run locally

If you want to develop Subsocial's web UI or just check it out locally, there is an easy way to do it.

Clone this repo:

```sh
git clone git@github.com:dappforce/dappforce-subsocial-ui.git
cd dappforce-subsocial-ui
```

Connect the app to Subsocial's server (Substrate node, IPFS):

```sh
cp subsocial-betanet.env .env
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

## Build with Docker

### Easy start

To start Subsocial web UI containerized (you should have `docker` installed):

```
docker run -d --rm --name subsocial-webui -p 3003:3003 dappforce/subsocial-ui:latest
```

### Start with `docker-compose`

This will start Subsocial web UI with an nginx support:

- Proxy web UI to the port `80`
- Proxy from `localhost/bc` to `localhost:3002` (where Polkadot.js Apps should be running)

```
docker-compose up -t docker/docker-compose.yml -d
```


### Build your own image

If you want to build docker image from your local repository (it takes a while...), in your shell:

```
docker build -f docker/Dockerfile -t [your_nickname]/subsocial-ui .
```

### Start all parts of Subsocial at once with [Subsocial Starter](https://github.com/dappforce/dark-starter).

## License

Darkdot is forked from the great Subsocial project by [DappForce](https://github.com/dappforce)

Darkdot is [GPL 3.0](./LICENSE) licensed.
