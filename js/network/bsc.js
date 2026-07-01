window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
const NETWORK = Object.freeze({

    chainId: 56,

    key: "bsc",

    name: "bsc",

    symbol: "BNB",

    decimals: 18,

    status: "coming_soon",

    contracts: Object.freeze({

        token: "",

        exchange: "",

        deployer: "",

        factory: ""

    }),

    abi: Object.freeze({

        token: "./abi/bsc/LaunchFutureToken.json",

        exchange: "./abi/bsc/LaunchFutureExchange.json",

        deployer: "./abi/bsc/LFTDeployer.json",

        factory: "./abi/bsc/LFTFactory.json"

    })

});

LF.net_bsc = NETWORK;

})(window.LF, window.ethers);
