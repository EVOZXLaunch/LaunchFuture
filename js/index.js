// =====================================================
// LaunchFuture
// Main Controller
// =====================================================

import {
    initUI,
    nextStep as uiNextStep,
    previousStep as uiPreviousStep,
    goToStep as uiGoToStep,
    getCurrentStep as uiGetCurrentStep,
    setWalletConnected,
    setWalletDisconnected,
    updatePreview,
    updateReview,
    updateDeployResult,
    appendConsole,
    showToast,
    showLoading,
    hideLoading
} from "./ui.js";

import {
    restoreConnection,
    connectWallet,
    disconnectWallet,
    isConnected,
    getAccount,
    getWallet,
    registerWalletEvents
} from "./wallet.js";

import {
    getFormattedBalance
} from "./blockchain.js";

import {
    initDateTime
} from "./datetime.js";

import {
    getWizardData,
    loadWizard,
    setTokenData,
    setFeatureData,
    setMetadataData,
    setPaymentData
} from "./wizard.js";

import {
    estimateDeployFee,
    buildTokenConfig,
    buildMetadata,
    deployToken,
    buildVerifyPackage
} from "./deploy.js";

import {
    validateTokenConfig
} from "./validation.js";

import {
    isSymbolAvailable
} from "./factory.js";

import {
    buildReview
} from "./review.js";

import {
    getCurrentNetwork
} from "./networks/index.js";

import FEATURES from "./features.js";

// =====================================================
// DOM HELPERS
// =====================================================

const $ = id => document.getElementById(id);
const $$ = selector => [...document.querySelectorAll(selector)];

// =====================================================
// APPLICATION STATE
// =====================================================

const state = {
    wallet: {
        connected: false,
        address: null
    },
    deployment: {
        fee: null,
        result: null,
        verifyPackage: null
    }
};

// =====================================================
// DOM CACHE
// =====================================================

const dom = {
    // navigation
    backButton: $("backButton"),
    nextButton: $("nextButton"),
    deployButton: $("deployButton"),

    // wallet
    connectWalletButton: $("connectWalletButton"),

    // timeline
    timeline: $$(".timelineStep"),

    // token
    tokenName: $("tokenName"),
    tokenSymbol: $("tokenSymbol"),
    tokenSupply: $("tokenSupply"),
    tokenDecimals: $("tokenDecimals"),
    tokenOwner: $("tokenOwner"),
    paymentMethod: $("paymentMethod"),

    // metadata
    website: $("website"),
    telegram: $("telegram"),
    twitter: $("twitter"),

    // review confirmations
    confirmInformation: $("confirmInformation"),
    confirmOwnership: $("confirmOwnership"),
    confirmIrreversible: $("confirmIrreversible"),

    // health / summary
    summaryNetwork: $("summaryNetwork"),
    healthProgress: $("healthProgress"),
    healthMessage: $("healthMessage"),
    enabledFeatureCount: $("enabledFeatureCount"),
    estimatedDeploySize: $("estimatedDeploySize"),

    // deploy
    deployResult: $("deployResult")
};

// =====================================================
// FEATURE INPUT CACHE
// =====================================================

const featureInputs = {};

function cacheFeatureInputs() {
    FEATURES.forEach(feature => {
        featureInputs[feature.key] = $(feature.id);
    });
}

function collectFeatureData() {
    const data = {};
    FEATURES.forEach(feature => {
        const input = featureInputs[feature.key];
        if (input) {
            data[feature.key] = Boolean(input.checked);
        }
    });
    return data;
}

// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
    try {
        initUI();
        initDateTime();
        loadWizard();
        cacheFeatureInputs();
        populateFormFromWizard();
        bindEvents();
        refreshFeatureSummary();
        updateLivePreview();
        await initializeWallet();
        registerWalletEvents({
            onAccountsChanged: handleAccountsChanged,
            onChainChanged: handleChainChanged,
            onDisconnect: handleWalletDisconnected
        });
    } catch (error) {
        console.error(error);
        showToast("Initialization Error", error?.message || "Failed to start the application.", "error");
    }
}

// =====================================================
// POPULATE FORM FROM SAVED WIZARD DATA
// =====================================================

function populateFormFromWizard() {
    const data = getWizardData();

    if (dom.tokenName && data.token.name) dom.tokenName.value = data.token.name;
    if (dom.tokenSymbol && data.token.symbol) dom.tokenSymbol.value = data.token.symbol;
    if (dom.tokenSupply && data.token.supply) dom.tokenSupply.value = data.token.supply;
    if (dom.tokenDecimals && data.token.decimals !== undefined) dom.tokenDecimals.value = data.token.decimals;
    if (dom.tokenOwner && data.token.owner) dom.tokenOwner.value = data.token.owner;
    if (dom.paymentMethod && data.payment.type) dom.paymentMethod.value = data.payment.type;

    if (dom.website && data.metadata.website) dom.website.value = data.metadata.website;
    if (dom.telegram && data.metadata.telegram) dom.telegram.value = data.metadata.telegram;
    if (dom.twitter && data.metadata.twitter) dom.twitter.value = data.metadata.twitter;

    FEATURES.forEach(feature => {
        const input = featureInputs[feature.key];
        if (input && data.features[feature.key] !== undefined) {
            input.checked = Boolean(data.features[feature.key]);
        }
    });
}

// =====================================================
// WALLET
// =====================================================

async function initializeWallet() {
    await restoreConnection();

    if (isConnected()) {
        state.wallet.connected = true;
        state.wallet.address = getAccount();
        await refreshWalletUI();
    } else {
        state.wallet.connected = false;
        state.wallet.address = null;
        setWalletDisconnected();
    }
}

async function refreshWalletUI() {
    const wallet = getWallet();

    let balance = "0";
    try {
        balance = await getFormattedBalance(wallet.account);
    } catch (error) {
        console.warn("Unable to fetch balance.", error);
    }

    setWalletConnected({
        address: wallet.account,
        provider: wallet.walletName || "EVM Wallet",
        network: wallet.network?.name || "-",
        balance
    });

    if (dom.tokenOwner && !dom.tokenOwner.value) {
        dom.tokenOwner.value = wallet.account;
        handleTokenFieldChange();
    }
}

async function handleConnectWallet() {
    if (isConnected()) {
        disconnectWallet();
        state.wallet.connected = false;
        state.wallet.address = null;
        setWalletDisconnected();
        showToast("Wallet Disconnected", "Your wallet has been disconnected.", "info");
        return;
    }

    try {
        showLoading("Connecting wallet...");
        await connectWallet();
        state.wallet.connected = true;
        state.wallet.address = getAccount();
        await refreshWalletUI();
        showToast("Wallet Connected", "Your wallet is now connected.", "success");
    } catch (error) {
        console.error(error);
        showToast("Connection Failed", error?.message || "Could not connect wallet.", "error");
    } finally {
        hideLoading();
    }
}

async function handleAccountsChanged() {
    if (isConnected()) {
        state.wallet.address = getAccount();
        await refreshWalletUI();
    } else {
        handleWalletDisconnected();
    }
}

async function handleChainChanged() {
    if (isConnected()) {
        await refreshWalletUI();
    }
}

function handleWalletDisconnected() {
    state.wallet.connected = false;
    state.wallet.address = null;
    setWalletDisconnected();
}

// =====================================================
// FORM -> WIZARD DATA
// =====================================================

function handleTokenFieldChange() {
    setTokenData({
        name: dom.tokenName?.value.trim() || "",
        symbol: dom.tokenSymbol?.value.trim().toUpperCase() || "",
        supply: dom.tokenSupply?.value || "",
        decimals: Number(dom.tokenDecimals?.value ?? 18),
        owner: dom.tokenOwner?.value.trim() || ""
    });
    updateLivePreview();
    updateHealth();
}

function handlePaymentChange() {
    const type = dom.paymentMethod?.value || "NATIVE";
    setPaymentData({ type, symbol: type });
    updateLivePreview();
    refreshFeeEstimate();
}

function handleMetadataChange() {
    setMetadataData({
        website: dom.website?.value.trim() || "",
        telegram: dom.telegram?.value.trim() || "",
        twitter: dom.twitter?.value.trim() || ""
    });
}

function handleFeatureChange() {
    setFeatureData(collectFeatureData());
    refreshFeatureSummary();
    updateLivePreview();
    updateHealth();
}

async function handleSymbolBlur() {
    const symbol = dom.tokenSymbol?.value.trim();

    if (!symbol) {
        return;
    }

    try {
        const available = await isSymbolAvailable(symbol);
        if (!available) {
            showToast("Symbol Unavailable", `"${symbol}" is already taken on this network.`, "warning");
        }
    } catch (error) {
        console.warn("Symbol availability check skipped.", error);
    }
}

// =====================================================
// LIVE PREVIEW
// =====================================================

function updateLivePreview() {
    const data = getWizardData();
    const enabledCount = Object.values(data.features).filter(Boolean).length;
    const network = getCurrentNetwork();

    updatePreview({
        name: data.token.name || "Token Name",
        symbol: data.token.symbol || "SYMBOL",
        owner: data.token.owner || "-",
        supply: data.token.supply || "-",
        decimals: data.token.decimals ?? 18,
        features: enabledCount,
        fee: state.deployment.fee || "Loading...",
        gas: "Estimated on deploy",
        health: `${calculateHealth(data)}%`,
        network: network.name,
        status: "Ready"
    });

    if (dom.summaryNetwork) {
        dom.summaryNetwork.textContent = network.name;
    }
}

function calculateHealth(data) {
    let score = 0;
    const checks = [
        Boolean(data.token.name),
        Boolean(data.token.symbol),
        Boolean(data.token.supply),
        Boolean(data.token.owner),
        Object.values(data.features).some(Boolean)
    ];
    checks.forEach(check => {
        if (check) score += 20;
    });
    return score;
}

function updateHealth() {
    const data = getWizardData();
    const health = calculateHealth(data);

    if (dom.healthProgress) {
        dom.healthProgress.style.width = `${health}%`;
    }

    if (dom.healthMessage) {
        dom.healthMessage.textContent = health >= 100
            ? "Configuration looks complete."
            : "Fill in the remaining token details.";
    }
}

function refreshFeatureSummary() {
    const enabledCount = Object.values(collectFeatureData()).filter(Boolean).length;

    if (dom.enabledFeatureCount) {
        dom.enabledFeatureCount.textContent = String(enabledCount);
    }

    if (dom.estimatedDeploySize) {
        const sizeKb = 24 + (enabledCount * 2);
        dom.estimatedDeploySize.textContent = `${sizeKb} KB`;
    }
}

async function refreshFeeEstimate() {
    const data = getWizardData();
    const payment = { type: data.payment.type || "NATIVE", symbol: data.payment.symbol || data.payment.type || "NATIVE" };

    try {
        const fee = await estimateDeployFee(payment);
        state.deployment.fee = String(fee);
    } catch (error) {
        console.warn("Fee estimation skipped (wallet not connected or RPC unavailable).", error);
        state.deployment.fee = null;
    }

    updateLivePreview();
}

// =====================================================
// REVIEW
// =====================================================

function refreshReview() {
    const review = buildReview();

    updateReview({
        name: review.token.name,
        symbol: review.token.symbol,
        supply: review.token.supply,
        decimals: review.token.decimals,
        owner: review.token.owner,
        network: review.network?.name
    });
}

// =====================================================
// STEP VALIDATION
// =====================================================

async function validateCurrentStep(step) {
    if (step === 2) {
        const data = getWizardData();
        const validation = await validateTokenConfig({
            ...data.token,
            ...data.features
        });

        if (!validation.valid) {
            const message = validation.errors?.[0]?.message || "Please complete the token configuration.";
            showToast("Incomplete Configuration", message, "warning");
            return false;
        }
    }

    if (step === 5) {
        const allConfirmed = [
            dom.confirmInformation,
            dom.confirmOwnership,
            dom.confirmIrreversible
        ].every(checkbox => checkbox?.checked);

        if (!allConfirmed) {
            showToast("Confirmation Required", "Please confirm all checkboxes before continuing.", "warning");
            return false;
        }
    }

    return true;
}

// =====================================================
// NAVIGATION
// =====================================================

async function handleNext() {
    const current = uiGetCurrentStep();
    const valid = await validateCurrentStep(current);

    if (!valid) {
        return;
    }

    uiNextStep();
    afterStepChange();
}

function handleBack() {
    uiPreviousStep();
    afterStepChange();
}

function handleTimelineClick(event) {
    const step = Number(event.currentTarget.dataset.step);
    uiGoToStep(step);
    afterStepChange();
}

function afterStepChange() {
    const step = uiGetCurrentStep();

    if (step === 5) {
        refreshReview();
    }

    if (step === 6) {
        refreshFeeEstimate();
    }
}

// =====================================================
// DEPLOY
// =====================================================

async function handleDeploy() {
    const data = getWizardData();

    const config = buildTokenConfig({
        ...data.token,
        features: data.features
    });

    const metadata = buildMetadata(data.metadata);

    const payment = {
        type: data.payment.type || "NATIVE",
        symbol: data.payment.symbol || data.payment.type || "NATIVE"
    };

    appendConsole("Starting deployment...");
    showLoading("Deploying your token...");

    try {
        if (!isConnected()) {
            appendConsole("Connecting wallet...");
            await connectWallet();
            await refreshWalletUI();
        }

        appendConsole("Validating configuration...");
        const result = await deployToken(config, metadata, payment);

        appendConsole(`Transaction confirmed: ${result.txHash}`);
        appendConsole(`Token deployed at: ${result.tokenAddress}`);

        updateDeployResult({
            contractAddress: result.tokenAddress,
            transactionHash: result.txHash,
            blockNumber: result.blockNumber
        });

        state.deployment.result = result;
        state.deployment.verifyPackage = buildVerifyPackage(result, config, metadata);

        if (dom.deployResult) {
            dom.deployResult.hidden = false;
        }

        showToast("Deployment Successful", "Your ERC20MAX token has been deployed.", "success");
    } catch (error) {
        console.error(error);
        appendConsole(`Error: ${error?.message || "Deployment failed."}`);
        showToast("Deployment Failed", error?.message || "Something went wrong.", "error");
    } finally {
        hideLoading();
    }
}

// =====================================================
// EVENTS
// =====================================================

function bindEvents() {
    dom.nextButton?.addEventListener("click", handleNext);
    dom.backButton?.addEventListener("click", handleBack);
    dom.deployButton?.addEventListener("click", handleDeploy);
    dom.connectWalletButton?.addEventListener("click", handleConnectWallet);

    dom.timeline.forEach(button => {
        button.addEventListener("click", handleTimelineClick);
    });

    [dom.tokenName, dom.tokenSupply, dom.tokenOwner].forEach(input => {
        input?.addEventListener("input", handleTokenFieldChange);
    });

    dom.tokenSymbol?.addEventListener("input", handleTokenFieldChange);
    dom.tokenSymbol?.addEventListener("blur", handleSymbolBlur);

    dom.tokenDecimals?.addEventListener("change", handleTokenFieldChange);
    dom.paymentMethod?.addEventListener("change", handlePaymentChange);

    [dom.website, dom.telegram, dom.twitter].forEach(input => {
        input?.addEventListener("input", handleMetadataChange);
    });

    FEATURES.forEach(feature => {
        const input = featureInputs[feature.key];
        input?.addEventListener("change", handleFeatureChange);
    });
}
