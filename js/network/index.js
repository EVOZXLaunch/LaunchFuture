window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// Storage
// =====================================================

const STORAGE_KEY =
    "launchfuture.network";

// =====================================================
// LaunchFuture
// Network Manager
// =====================================================

const EVOZ = LF.net_evoz;
const ETHEREUM = LF.net_ethereum;
const BSC = LF.net_bsc;
const POLYGON = LF.net_polygon;
const ARBITRUM = LF.net_arbitrum;
const BASE = LF.net_base;
// =====================================================
// Networks
// =====================================================

const NETWORKS = Object.freeze({

    [EVOZ.key]: EVOZ,

    [ETHEREUM.key]: ETHEREUM,

    [BSC.key]: BSC,

    [POLYGON.key]: POLYGON,

    [ARBITRUM.key]: ARBITRUM,

    [BASE.key]: BASE

});

// =====================================================
// Current Network
// =====================================================

let currentNetwork =
    EVOZ;

const savedNetwork =

    localStorage.getItem(
        STORAGE_KEY
    );

if (

    savedNetwork &&
    NETWORKS[savedNetwork]

) {

    currentNetwork =
        NETWORKS[savedNetwork];

}

// =====================================================
// Get
// =====================================================

function getCurrentNetwork() {

    return currentNetwork;

}

function getNetwork(key) {

    return NETWORKS[key] ?? null;

}

function getSupportedNetworks() {

    return Object.values(
        NETWORKS
    );

}

// =====================================================
// Set
// =====================================================

function setCurrentNetwork(
    key
) {

    const network =
        getNetwork(key);

    if (!network) {

        throw new Error(

            `Unsupported network: ${key}`

        );

    }

    currentNetwork =
        network;

    localStorage.setItem(

        STORAGE_KEY,

        key

    );

    return currentNetwork;

}

// =====================================================
// Chain ID
// =====================================================

function getNetworkByChainId(
    chainId
) {

    return (

        Object
            .values(NETWORKS)

            .find(

                network =>

                    Number(
                        network.chainId
                    ) ===
                    Number(
                        chainId
                    )

            )

        ?? null

    );

}

// =====================================================
// Export
// =====================================================

LF.networks = {
    getCurrentNetwork,
    getNetwork,
    getSupportedNetworks,
    setCurrentNetwork,
    getNetworkByChainId
};

})(window.LF, window.ethers);
