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
      USDTContractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      PaymentContractAddress: "0x58c9ac08ecb1aa7ebdd603ff162c731434f64bd1",
      Web3Modal: {
        network: 1,
        rpcUrl:'https://mainnet.infura.io/v3/defa9004b56046e1a9ba73bc5d9e5776',
        walletUrl:'https://mainnet.infura.io/v3/',
        chainName: 'Ethereum Mainnet'
      },
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      blockExplorerUrls:'https://etherscan.io/'
    },
    BSC_NETWORK : {
      USDTContractAddress: "0x55d398326f99059fF775485246999027B3197955",
      PaymentContractAddress: "0xd307e69756c5adce00234dbff03681c71e0daf86",
      Web3Modal: {
        network: 56,
        rpcUrl:'https://rpc.ankr.com/bsc',
        walletUrl:'https://bsc-dataseed1.binance.org',
        chainName: 'Binance SmartChain Mainnet',
      },
      nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
      },
      blockExplorerUrls:'https://bscscan.com'
    },
    POLY_NETWORK : {
      USDTContractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      PaymentContractAddress: "0xd307e69756c5adce00234dbff03681c71e0daf86",
      Web3Modal: {
        network: 137,
        rpcUrl:'https://rpc.ankr.com/polygon',
        walletUrl:'https://polygon-rpc.com/',
        chainName: 'Polygon Mainnet'
      },
      nativeCurrency: {
        name: 'Matic Coin',
        symbol: 'MATIC',
        decimals: 18
      },
      blockExplorerUrls:'https://polygonscan.com/'
    }
  }
};

