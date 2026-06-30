// =====================================================
// LaunchFuture
// Factory Manager
// =====================================================

import {

    getCurrentNetwork

} from "./networks/index.js";

import {

    loadABI

} from "./abi/loader.js";

import {

    getContract

} from "./blockchain.js";

// =====================================================
// State
// =====================================================

let factory = null;

let factoryABI = null;

// =====================================================
// Factory Contract
// =====================================================

export async function getFactory() {

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
// Reset
// =====================================================

export function clearFactory() {

    factory = null;

    factoryABI = null;

}

// =====================================================
// Symbol
// =====================================================

export async function symbolExists(
    symbol
) {

    const contract =
        await getFactory();

    return await contract
        .symbolExists(
            symbol
        );

}

export async function isSymbolAvailable(
    symbol
) {

    const contract =
        await getFactory();

    return await contract
        .isSymbolAvailable(
            symbol
        );

}

// =====================================================
// Payment
// =====================================================

export async function getPaymentMethod(
    symbol
) {

    const contract =
        await getFactory();

    return await contract
        .getPaymentMethod(
            symbol
        );

}

export async function getDeployFee(
    paymentSymbol
) {

    const contract =
        await getFactory();

    return await contract
        .getDeployFee(
            paymentSymbol
        );

}

export async function quoteNativeFee(
    paymentSymbol
) {

    const contract =
        await getFactory();

    return await contract
        .quoteNativeFee(
            paymentSymbol
        );

}

// =====================================================
// Statistics
// =====================================================

export async function getStatistics() {

    const contract =
        await getFactory();

    return await contract
        .getStatistics();

}

export async function getFactoryTokenCount() {

    const contract =
        await getFactory();

    return await contract
        .getFactoryTokenCount();

}

// =====================================================
// Predict
// =====================================================

export async function predictTokenAddress(
    config,
    metadata,
    salt
) {

    const contract =
        await getFactory();

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

export async function deployWithNative(
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

export async function deployWithPermit(
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

export async function deployCreate2(
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

export default {

    getFactory,

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
