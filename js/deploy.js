// =====================================================
// LaunchFuture
// Deploy Manager
// =====================================================

import {

    connectWallet,

    isConnected

} from "./wallet.js";

import {

    getDeployFee,

    deployWithNative,

    deployWithPermit,

    deployCreate2

} from "./factory.js";

import {

    validateTokenConfig

} from "./validation.js";

// =====================================================
// Deploy Status
// =====================================================

export const DEPLOY_STATUS =

    Object.freeze({

        IDLE:
            "IDLE",

        VALIDATING:
            "VALIDATING",

        CONNECTING:
            "CONNECTING",

        WAIT_SIGNATURE:
            "WAIT_SIGNATURE",

        SUCCESS:
            "SUCCESS",

        FAILED:
            "FAILED"

    });

// =====================================================
// State
// =====================================================

let deployStatus =

    DEPLOY_STATUS.IDLE;

// =====================================================
// Status
// =====================================================

export function getDeployStatus() {

    return deployStatus;

}

export function resetDeployStatus() {

    deployStatus =

        DEPLOY_STATUS.IDLE;

}

function setDeployStatus(
    status
) {

    deployStatus = status;

}

// =====================================================
// Token Config
// =====================================================

export function buildTokenConfig(
    data
) {

    return {

        name:
            data.name,

        symbol:
            data.symbol,

        supply:
            data.supply,

        decimals:
            data.decimals,

        owner:
            data.owner,

        features:
            data.features

    };

}

// =====================================================
// Metadata
// =====================================================

export function buildMetadata(
    data
) {

    return {

        website:
            data.website,

        telegram:
            data.telegram,

        twitter:
            data.twitter,

        logoURI:
            data.logoURI

    };

}

// =====================================================
// Fee
// =====================================================

export async function estimateDeployFee(
    payment
) {

    return await getDeployFee(

        payment.symbol

    );

}

// =====================================================
// Deploy
// =====================================================

export async function deployToken(
    config,
    metadata,
    payment
) {

    try {

        setDeployStatus(

            DEPLOY_STATUS.CONNECTING

        );

        if (

            !isConnected()

        ) {

            await connectWallet();

        }

        setDeployStatus(

            DEPLOY_STATUS.VALIDATING

        );

        const validation =

            await validateTokenConfig(
                config
            );

        if (

            !validation.valid

        ) {

            throw validation;

        }

        setDeployStatus(

            DEPLOY_STATUS.WAIT_SIGNATURE

        );

        let result;

        switch (

            payment.type

        ) {

            case "NATIVE":

                result =

                    await deployWithNative(

                        config,

                        metadata

                    );

                break;

            case "PERMIT":

                result =

                    await deployWithPermit(

                        config,

                        metadata

                    );

                break;

            case "CREATE2":

                result =

                    await deployCreate2(

                        config,

                        metadata

                    );

                break;

            default:

                throw new Error(

                    "Unsupported payment type."

                );

        }

        setDeployStatus(

    DEPLOY_STATUS.SUCCESS

);

return buildDeployResult(

    result,

    payment

);

    }

    catch (

        error

    ) {

        setDeployStatus(

            DEPLOY_STATUS.FAILED

        );

        throw error;

    }

}

// =====================================================
// Deploy Result
// =====================================================

export function buildDeployResult(
    result,
    payment
) {

    return {

        success: true,

        payment,

        tokenAddress:

            result.tokenAddress,

        txHash:

            result.txHash,

        blockNumber:

            result.blockNumber,

        timestamp:

            Date.now()

    };

}

// =====================================================
// Helpers
// =====================================================

export function isDeployIdle() {

    return (

        deployStatus ===

        DEPLOY_STATUS.IDLE

    );

}

export function isDeploying() {

    return (

        deployStatus !==

            DEPLOY_STATUS.IDLE &&

        deployStatus !==

            DEPLOY_STATUS.SUCCESS &&

        deployStatus !==

            DEPLOY_STATUS.FAILED

    );

}

export function isDeploySuccessful(
    result
) {

    return Boolean(

        result?.success

    );

}

export function isDeployFailed() {

    return (

        deployStatus ===

        DEPLOY_STATUS.FAILED

    );

}

// =====================================================
// Verify Package
// =====================================================

export function buildVerifyPackage(
    result,
    config,
    metadata
) {

    return {

        success:
            result.success,

        tokenAddress:
            result.tokenAddress,

        txHash:
            result.txHash,

        blockNumber:
            result.blockNumber,

        timestamp:
            result.timestamp,

        token: {

            name:
                config.name,

            symbol:
                config.symbol,

            supply:
                config.supply,

            decimals:
                config.decimals

        },

        metadata: {

            website:
                metadata.website,

            telegram:
                metadata.telegram,

            twitter:
                metadata.twitter,

            logoURI:
                metadata.logoURI

        }

    };

}
