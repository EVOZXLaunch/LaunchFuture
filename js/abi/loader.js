window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// LaunchFuture
// ABI Loader
// =====================================================

const { getCurrentNetwork } = LF.networks;
// =====================================================
// Cache
// =====================================================

const cache =
    new Map();

// =====================================================
// Load ABI
// =====================================================

async function loadABI(
    contractName
) {

    const network =
        getCurrentNetwork();

    const cacheKey =

        `${network.key}:${contractName}`;

    if (

        cache.has(
            cacheKey
        )

    ) {

        return cache.get(
            cacheKey
        );
        
    }

    const response =
        await fetch(

            `./abi/${network.key}/${contractName}.json`

        );

    if (

        !response.ok

    ) {

        throw new Error(

            `Unable to load ABI: ${contractName}`

        );

    }

    const abi =
        await response.json();

    cache.set(

        cacheKey,

        abi

    );

    return abi;

}

// =====================================================
// Cache
// =====================================================

function clearABICache() {

    cache.clear();

}

function hasABI(
    contractName
) {

    const network =
        getCurrentNetwork();

    return cache.has(

        `${network.key}:${contractName}`

    );

}

LF.abiLoader = {
    loadABI,
    clearABICache,
    hasABI
};

})(window.LF, window.ethers);
