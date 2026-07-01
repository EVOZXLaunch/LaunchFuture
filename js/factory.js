window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// LaunchFuture
// Factory Manager
// =====================================================

const { getCurrentNetwork } = LF.networks;
const { loadABI } = LF.abiLoader;
const { getContract } = LF.blockchain;
// =====================================================
// State
// =====================================================

let factory = null;

let factoryReadOnly = null;

let factoryABI = null;

// =====================================================
// Factory Contract (signer-bound — required for txs)
// =====================================================

async function getFactory() {

    if (factory) {

        return factory;

    }

    const network =
        getCurrentNetwork();

    factoryABI =
        await loadABI(
            "LFTFactory"
        );

    factory =
    await getContract(

        network.contracts.factory,

        factoryABI

    );

    return factory;

}

// =====================================================
// Factory Contract (read-only — no signer/wallet needed)
// Used for view calls (fees, payment methods, stats, etc)
// so they work even before a wallet is connected.
// =====================================================

async function getFactoryReadOnly() {

    if (factoryReadOnly) {

        return factoryReadOnly;

    }

    const network =
        getCurrentNetwork();

    factoryABI =
        factoryABI ??
        await loadABI(
            "LFTFactory"
        );

    factoryReadOnly =
    await getContract(

        network.contracts.factory,

        factoryABI,

        true

    );

    return factoryReadOnly;

}

// =====================================================
// Reset
// =====================================================

function clearFactory() {

    factory = null;

    factoryReadOnly = null;

    factoryABI = null;

}

// =====================================================
// Symbol
// =====================================================

async function symbolExists(
    symbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .symbolExists(
            symbol
        );

}

async function isSymbolAvailable(
    symbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .isSymbolAvailable(
            symbol
        );

}

// =====================================================
// Payment
// =====================================================

async function getPaymentMethod(
    symbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getPaymentMethod(
            symbol
        );

}

async function getDeployFee(
    paymentSymbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getDeployFee(
            paymentSymbol
        );

}

async function quoteNativeFee(
    paymentSymbol
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .quoteNativeFee(
            paymentSymbol
        );

}

// =====================================================
// Statistics
// =====================================================

async function getStatistics() {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getStatistics();

}

async function getFactoryTokenCount() {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .getFactoryTokenCount();

}

// =====================================================
// Predict
// =====================================================

async function predictTokenAddress(
    config,
    metadata,
    salt
) {

    const contract =
        await getFactoryReadOnly();

    return await contract
        .predictTokenAddress(

            config,

            metadata,

            salt

        );

}

// =====================================================
// Transaction
// =====================================================

async function executeTransaction(
    tx
) {

    const receipt =

        await tx.wait();

    return {

        tx,

        receipt,

        txHash:

            receipt.hash,

        blockNumber:

            receipt.blockNumber

    };

}

// =====================================================
// Deploy
// =====================================================

async function deployWithNative(
    config,
    metadata,
    value
) {

    const contract =
        await getFactory();

    const tx =
        await contract.deployWithNative(

            config,

            metadata,

            {

                value

            }

        );

    return await executeTransaction(

    tx

);

}

async function deployWithPermit(
    config,
    metadata,
    paymentSymbol,
    deadline,
    v,
    r,
    s
) {

    const contract =
        await getFactory();

    const tx =
        await contract.deployWithPermit(

            config,

            metadata,

            paymentSymbol,

            deadline,

            v,

            r,

            s

        );

    return await executeTransaction(

    tx

);

}

async function deployCreate2(
    config,
    metadata,
    paymentSymbol,
    salt
) {

    const contract =
        await getFactory();

    const tx =
        await contract.deployCreate2(

            config,

            metadata,

            paymentSymbol,

            salt

        );

    return await executeTransaction(

    tx

);

}

// =====================================================
// Export
// =====================================================

LF.factory = {

    getFactory,

    getFactoryReadOnly,

    clearFactory,

    symbolExists,

    isSymbolAvailable,

    getPaymentMethod,

    getDeployFee,

    quoteNativeFee,

    getStatistics,

    getFactoryTokenCount,

    predictTokenAddress,

    deployWithNative,

    deployWithPermit,

    deployCreate2

};

})(window.LF, window.ethers);
