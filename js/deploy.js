// =====================================================
// LaunchFuture
// Deploy Manager (updated with full payment support)
// =====================================================

import { connectWallet, isConnected, getSigner } from "./wallet.js";
import { deployWithNative, deployWithPermit, getFactory } from "./factory.js";
import { validateTokenConfig } from "./validation.js";
import { getSelectedPayment, signPermit } from "./payment.js";
import { getCurrentNetwork } from "./networks/index.js";
import { getContract } from "./blockchain.js";
import { loadABI } from "./abi/loader.js";
import { DEPLOY } from "./config.js";

// =====================================================
// Status
// =====================================================

export const DEPLOY_STATUS = Object.freeze({
    IDLE:           "IDLE",
    VALIDATING:     "VALIDATING",
    CONNECTING:     "CONNECTING",
    SIGNING_PERMIT: "SIGNING_PERMIT",
    WAIT_SIGNATURE: "WAIT_SIGNATURE",
    PENDING:        "PENDING",
    SUCCESS:        "SUCCESS",
    FAILED:         "FAILED"
});

let deployStatus = DEPLOY_STATUS.IDLE;

export const getDeployStatus   = () => deployStatus;
export const resetDeployStatus = () => { deployStatus = DEPLOY_STATUS.IDLE; };
const setStatus = s => { deployStatus = s; };

// =====================================================
// Config builders
// =====================================================

export function buildTokenConfig(data) {
    return {
        name:    data.name,
        symbol:  data.symbol,
        supply:  data.supply,
        decimals: data.decimals,
        owner:   data.owner,
        features: data.features
    };
}

export function buildMetadata(data) {
    return {
        website:  data.website  || "",
        telegram: data.telegram || "",
        twitter:  data.twitter  || "",
        logoURI:  data.logoURI  || ""
    };
}

// =====================================================
// Deploy
// =====================================================

export async function deployToken(config, metadata) {
    try {
        setStatus(DEPLOY_STATUS.CONNECTING);
        if (!isConnected()) await connectWallet();

        setStatus(DEPLOY_STATUS.VALIDATING);
        const validation = await validateTokenConfig(config);
        if (!validation.valid) throw validation;

        const payment = getSelectedPayment();
        if (!payment) throw new Error("No payment method selected.");

        setStatus(DEPLOY_STATUS.WAIT_SIGNATURE);

        let result;

        if (payment.isNative) {
            // ── Native coin payment (e.g. EVOZ) ──
            result = await deployWithNative(config, metadata, payment.fee);

        } else {
            // ── ERC-20 permit payment (e.g. LFT) ──
            setStatus(DEPLOY_STATUS.SIGNING_PERMIT);
            const signer      = await getSigner();
            const network     = getCurrentNetwork();
            const tokenABI    = await loadABI("LaunchFutureToken");
            const tokenContract = await getContract(network.contracts.token, tokenABI);
            const factory     = await getFactory();
            const factoryAddr = await factory.getAddress();
            const deadline    = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

            const { v, r, s } = await signPermit(
                signer,
                tokenContract,
                factoryAddr,
                payment.fee,
                deadline
            );

            setStatus(DEPLOY_STATUS.WAIT_SIGNATURE);
            result = await deployWithPermit(
                config, metadata,
                payment.symbol,
                deadline, v, r, s
            );
        }

        setStatus(DEPLOY_STATUS.SUCCESS);
        return buildDeployResult(result, payment);

    } catch (error) {
        setStatus(DEPLOY_STATUS.FAILED);
        throw normalizeError(error);
    }
}

// =====================================================
// Helpers
// =====================================================

function normalizeError(error) {
    if (error?.code === 4001 || error?.code === "ACTION_REJECTED")
        return new Error("Transaction rejected by user.");
    return error;
}

export function buildDeployResult(result, payment) {
    return {
        success:      true,
        payment,
        tokenAddress: result.tokenAddress,
        txHash:       result.txHash,
        blockNumber:  result.blockNumber,
        timestamp:    Date.now()
    };
}

export function buildVerifyPackage(result, config, metadata) {
    return {
        success:      result.success,
        tokenAddress: result.tokenAddress,
        txHash:       result.txHash,
        blockNumber:  result.blockNumber,
        timestamp:    result.timestamp,
        token:        { name: config.name, symbol: config.symbol, supply: config.supply, decimals: config.decimals },
        metadata:     { website: metadata.website, telegram: metadata.telegram, twitter: metadata.twitter, logoURI: metadata.logoURI }
    };
}

export const isDeployIdle       = () => deployStatus === DEPLOY_STATUS.IDLE;
export const isDeploying        = () => !["IDLE","SUCCESS","FAILED"].includes(deployStatus);
export const isDeploySuccessful = r  => Boolean(r?.success);
export const isDeployFailed     = () => deployStatus === DEPLOY_STATUS.FAILED;

export default { deployToken, buildTokenConfig, buildMetadata, buildDeployResult, buildVerifyPackage,
                 getDeployStatus, resetDeployStatus, isDeployIdle, isDeploying, isDeploySuccessful, isDeployFailed };
