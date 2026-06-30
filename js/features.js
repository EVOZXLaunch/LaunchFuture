// =====================================================
// LaunchFuture
// Feature Registry
// =====================================================
//
// NOTE:
// `id`  -> the actual DOM element id of the checkbox in index.html
// `key` -> the short property name used inside wizardData.features
//          and inside the on-chain token configuration object.
// =====================================================

const FEATURES = [

    // =================================================
    // Core
    // =================================================

    {
        id: "featureMintable",
        key: "mintable",
        label: "Mintable",
        category: "core",
        type: "boolean"
    },

    {
        id: "featureBurnable",
        key: "burnable",
        label: "Burnable",
        category: "core",
        type: "boolean"
    },

    // =================================================
    // Trading
    // =================================================

    {
        id: "featureTrading",
        key: "tradingEnable",
        label: "Trading Enable",
        category: "trading",
        type: "boolean"
    },

    {
        id: "featureTradingDelay",
        key: "tradingDelay",
        label: "Trading Delay",
        category: "trading",
        type: "boolean"
    },

    // =================================================
    // Security
    // =================================================

    {
        id: "featureAntiBot",
        key: "antiBot",
        label: "Anti Bot",
        category: "security",
        type: "boolean"
    },

    {
        id: "featureBlacklist",
        key: "blacklist",
        label: "Blacklist",
        category: "security",
        type: "boolean"
    },

    {
        id: "featureWhitelist",
        key: "whitelist",
        label: "Whitelist",
        category: "security",
        type: "boolean"
    },

    // =================================================
    // Limits
    // =================================================

    {
        id: "featureMaxWallet",
        key: "maxWallet",
        label: "Max Wallet",
        category: "limits",
        type: "boolean"
    },

    {
        id: "featureMaxTx",
        key: "maxTx",
        label: "Max Transaction",
        category: "limits",
        type: "boolean"
    }

];

export default FEATURES;
