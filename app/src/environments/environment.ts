// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://api.opticash.io/',
  config: {
    base_url: "http://localhost:4200",
    blockchain: "Ethereum Mainnet",
    blockchain_url: "https://etherscan.io/",
    
    Token		: "0x1c158ed21554507893fce5fecd6ddb48c2fa3f1b",
    Marketing	: "0xC1AE22aa796565cD6b572a07cb55e5E51504F5Cb",
    Team		: "0x5520AaeB7A3Ef1A526DF0E601f3E889f7c786ECA",
    Strategic	: "0xCa7a67D79C40f4AfFaA9271457804809dA6c8Ed3",
    Community	: "0x0c86B9544bb407FF06820b9516c2CDe26396AAA4",
    Liquidity	: "0x7b6441019E613a19D6894CC298f3b8BBC430D7ae",
    Private		: "0x45d998d4BaCb3FF79092c1DD437355017fe83d5D",
    Foundation	: "0x32f8718F5DfaE54aef19e6cC1872d438eb5a6f34",
    Adviser		: "0x8753E107c221FDcC02D21126f9B9c18054Dd463b",
    ETH_NETWORK : {
      USDTContractAddress: "0x51472dC2431541DEDC0d7bd4286c9901C01740B5",
      PaymentContractAddress: "0x7FAE70b1a009484c79c2b94a22991bcD63248205",
      Web3Modal: {
        network: 5,
        rpcUrl:'https://rpc.ankr.com/eth_goerli',
        walletUrl:'https://rpc.ankr.com/eth_goerli',
        chainName: 'Goerli test network'
      },
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      blockExplorerUrls:'https://goerli.etherscan.io/'
    },
    BSC_NETWORK : {
      USDTContractAddress: "0xd307e69756c5adce00234dbff03681c71e0daf86",
      PaymentContractAddress: "0x4036A25a132c8fc735F480b02a44c241d1DE7532",
      Web3Modal: {
        network: 97,
        rpcUrl:'https://rpc.ankr.com/bsc_testnet_chapel',
        walletUrl:'https://rpc.ankr.com/bsc_testnet_chapel',
        chainName: 'Binance TestChain',
      },
      nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
      },
      blockExplorerUrls:'https://testnet.bscscan.com'
    },
    POLY_NETWORK : {
      USDTContractAddress: "0xE097d6B3100777DC31B34dC2c58fB524C2e76921",
      PaymentContractAddress: "0x0a6bCb55b5981A25206B9C4b438a62CF76b66625",
      Web3Modal: {
        network: 80001,
        rpcUrl:'https://rpc.ankr.com/polygon_mumbai',
        walletUrl:'https://rpc.ankr.com/polygon_mumbai',
        chainName: 'Polygon TestChain'
      },
      nativeCurrency: {
        name: 'Matic Coin',
        symbol: 'MATIC',
        decimals: 18
      },
      blockExplorerUrls:'https://mumbai-explorer.matic.today/'
    }
  }
};

