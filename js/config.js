// =====================================================
// Launch Future
// Global Configuration
// =====================================================

export const APP = Object.freeze({

    name:
        "LaunchFuture",

    version:
        "1.0.0",

    description:
        "Decentralized Multi-Chain Token Launch Platform",

    author:
        "LaunchFuture",

    website:
        "",

    github:
        ""

});

// =====================================================
// Default Network
// =====================================================

export const DEFAULT_NETWORK =

    "evoz";

// =====================================================
// Contracts
// =====================================================

export const CONTRACTS = Object.freeze({

    evoz: Object.freeze({

        treasury:
            "0x50Cd30Ff7f0fbBD9d0FDe1F60DE8c52D6F390c5C",

        factory:
            "0xcd86Ca358283f06581365635372E5bF0D30271D3",

        deployer:
            "0x3f81E785628D452A8Aae1536D15A3586B490F0c5",

        exchange:
            "0x9680B43F695d5245062e59CCA92ad92DE5aed56e",

        utilityToken:
            "0x62B9559F193d111aF92d9a5604d79024BFB1C847"

    }),

    ethereum: Object.freeze({

        treasury: "",

        factory: "",

        deployer: "",

        exchange: "",

        utilityToken: ""

    }),

    bsc: Object.freeze({

        treasury: "",

        factory: "",

        deployer: "",

        exchange: "",

        utilityToken: ""

    }),

    polygon: Object.freeze({

        treasury: "",

        factory: "",

        deployer: "",

        exchange: "",

        utilityToken: ""

    }),

    arbitrum: Object.freeze({

        treasury: "",

        factory: "",

        deployer: "",

        exchange: "",

        utilityToken: ""

    }),

    base: Object.freeze({

        treasury: "",

        factory: "",

        deployer: "",

        exchange: "",

        utilityToken: ""

    })

});

// =====================================================
// Wallet
// =====================================================

export const WALLET = Object.freeze({

    autoConnect:
        true,

    autoSwitchNetwork:
        true,

    reconnect:
        true

});

// =====================================================
// Deploy
// =====================================================

export const DEPLOY = Object.freeze({

    confirmations:
        1,

    gasMultiplier:
        1.20

});

// =====================================================
// UI
// =====================================================

export const UI = Object.freeze({

    animation:

        true,

    toastDuration:

        5000,

    loadingDelay:

        250

});

// =====================================================
// Validation
// =====================================================

export const LIMITS = Object.freeze({

    minNameLength:
        2,

    maxNameLength:
        64,

    minSymbolLength:
        2,

    maxSymbolLength:
        12,

    maxWebsiteLength:
        256,

    maxSocialLength:
        256

});

// =====================================================
// Export
// =====================================================

export default {

    APP,

    CONTRACTS,

    WALLET,

    UI,

    DEPLOY,

    LIMITS,

    DEFAULT_NETWORK

};
