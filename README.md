# Simple 1inch Trading Bot
## Trading Strategy
![image](https://user-images.githubusercontent.com/45054071/136684673-0bda3848-459a-47a3-8bff-92e65f1c3144.png)

This bot trades based on the price change from the last buy/sell action. First, it sets the base price to the current, and update it when the bot executes trade. Here is an example of how this would trade when trading Matic and DAI. It sets the threshold as 3%.

![image](https://user-images.githubusercontent.com/45054071/136684280-3c249357-cfd3-402d-b92c-3d61c2ba378d.png)

## Installation and Setup

### 1. Install [Node.js](https://nodejs.org/en/) & [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable), if you haven't already.

### 2. Clone This Repo

Run the following command.

```console
git clone https://github.com/yuichiroaoki/1inch-trading-bot.git
```

## Quickstart

Right now this repo only works with hardhat mainnet fork.

### 1. Setup Environment Variables

You'll need an ALCHEMY_POLYGON_RPC_URL environment variable. You can get one from [Alchemy website](https://alchemy.com/?r=33851811-6ecf-40c3-a36d-d0452dda8634) for free.  
Also you need to add your PRIVATE_KEY environment variable, with a private key from you wallet.

\*Note: If using metamask, you'll have to add a 0x to the start of your private key)

Then, you can create a .env file with the following.

```
ALCHEMY_POLYGON_RPC_URL=<your-own-alchemy-polygon-rpc-url>
PRIVATE_KEY=<your-private_key>
```

### 2. Install Dependencies

Run the following command.

```console
yarn install
```

### 3. Set Config (Optional)

Change the config in src/config.ts if you want.

### 4. Run Bot

```
yarn start
```

You can also deploy with docker.
