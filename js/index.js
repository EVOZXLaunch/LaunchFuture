window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// ===================================================== 
// LaunchFuture Main Controller Part 1 
// Foundation 
// =====================================================

const { initUI, nextStep, previousStep, goToStep, getCurrentStep, setWalletConnected, setWalletDisconnected, initTheme, toggleTheme, bindModal, openModal, closeModal, showToast } = LF.ui;
const { restoreConnection, connectWallet, disconnectWallet, isConnected, getAccount, getWalletName, getNetwork } = LF.wallet;
const { getFormattedBalance } = LF.blockchain;
const { initDateTime } = LF.datetime;
const { getWizardData, loadWizard, saveWizard, setTokenData, setMetadataData, setFeatureData } = LF.wizard;
const { buildTokenConfig, buildMetadata, deployToken, buildVerifyPackage } = LF.deploy;
const { isSymbolAvailable } = LF.factory;
const FEATURES = LF.features;
const { loadPaymentMethods, renderPaymentCards, getSelectedPayment, getLoadedMethods } = LF.payment;
const { formatUnits } = ethers;
// =====================================================
// DOM HELPERS
// =====================================================

const $ = id =>

    document.getElementById(id);

const $$ = selector =>

    [...document.querySelectorAll(selector)];


// =====================================================
// APPLICATION STATE
// =====================================================

const state = {

    step: 1,

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

    backButton:

        $("backButton"),

    nextButton:

        $("nextButton"),

    deployButton:

        $("deployButton"),

    stepCounter:

        $("stepCounter"),

    timeline:

        $$(".timelineStep"),

    wizardSteps:

        $$(".wizardStep"),

    // wallet

    connectWalletButton:

        $("connectWalletButton"),

    walletConnectionStatus:

        $("walletConnectionStatus"),

    walletProviderName:

        $("walletProviderName"),

    walletAddress:

        $("walletAddress"),

    walletNetwork:

        $("walletNetwork"),

    walletBalance:

        $("walletBalance"),

    walletBadge:

        $("walletBadge"),

    // token

    tokenName:

        $("tokenName"),

    tokenSymbol:

        $("tokenSymbol"),

    tokenSupply:

        $("tokenSupply"),

    tokenDecimals:

        $("tokenDecimals"),

    tokenOwner:

        $("tokenOwner"),

    paymentMethod:

        $("paymentMethod"),

    // metadata

    website:

        $("website"),

    telegram:

        $("telegram"),

    twitter:

        $("twitter"),

    // preview

    previewName:

        $("previewName"),

    previewSymbol:

        $("previewSymbol"),

    previewSupply:

        $("previewSupply"),

    previewDecimals:

        $("previewDecimals"),

    previewOwner:

        $("previewOwner"),

    previewFee:

        $("previewFee"),

    previewFeatures:

        $("previewFeatures"),

    // review

    reviewName:

        $("reviewName"),

    reviewSymbol:

        $("reviewSymbol"),

    reviewSupply:

        $("reviewSupply"),

    reviewDecimals:

        $("reviewDecimals"),

    reviewOwner:

        $("reviewOwner"),

    reviewNetwork:

        $("reviewNetwork"),

    // deploy

    deployConsole:

        $("deployConsoleOutput"),

    contractAddress:

        $("contractAddress"),

    transactionHash:

        $("transactionHash"),

    blockNumber:

        $("blockNumber")

};


// =====================================================
// SAFE SETTERS
// =====================================================

function setText(

    element,

    value = "-"

){

    if(

        element

    ){

        element.textContent =

            value;

    }

}

function setHTML(

    element,

    value = ""

){

    if(

        element

    ){

        element.innerHTML =

            value;

    }

}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    initialize

);

async function initialize(){

    try{

        initUI();

        initTheme();

        bindModal();

        initDateTime();

        loadWizard();

        cacheFeatureInputs();

        bindEvents();

        await initializeWallet();

    }

    catch(error){

        console.error("App initialization failed:", error);

showToast({
    title: "Something went wrong",
    message: "The app failed to start properly. Please refresh the page. If the problem persists, contact support.",
    variant: "error"
});

    }

}


// =====================================================
// FEATURE CACHE
// =====================================================

const featureInputs = {};

function cacheFeatureInputs(){

    FEATURES.forEach(

        feature=>{

            featureInputs[

                feature.id

            ] =

                $(feature.id);

        }

    );

}


// =====================================================
// WALLET
// =====================================================

async function initializeWallet(){

    await restoreConnection();

    if(

        isConnected()

    ){

        state.wallet.connected =

            true;

        state.wallet.address =

            getAccount();

        let balance = "0";
        try {
            balance = await getFormattedBalance(state.wallet.address);
        } catch (balErr) {
            console.warn("Balance fetch failed:", balErr);
        }

        setWalletConnected({

    address:

        state.wallet.address,

    provider:

        getWalletName() || "EVM Wallet",

    network:

        getNetwork()?.name || "-",

    balance

});

    }

    else{

        state.wallet.connected =

            false;

        state.wallet.address =

            null;

        setWalletDisconnected();

    }

}

// =====================================================
// EVENTS
// =====================================================

function bindEvents() {

    dom.nextButton?.addEventListener(

        "click",

        handleNextStep

    );

    dom.backButton?.addEventListener(

        "click",

        handlePreviousStep

    );

    dom.connectWalletButton?.addEventListener(

        "click",

        handleConnectWallet

    );

    $("stepConnectWalletButton")?.addEventListener(

        "click",

        handleConnectWallet

    );

    $("themeButton")?.addEventListener(

        "click",

        toggleTheme

    );

    $("feeCalculatorButton")?.addEventListener(

        "click",

        openFeeCalculator

    );

    dom.timeline.forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    handleGoToStep(

                        Number(

                            button.dataset.step

                        )

                    );

                }

            );

        }

    );

}


// =====================================================
// STEP NAVIGATION (wrapped so we can react to step changes)
// =====================================================

function handleNextStep() {
    nextStep();
    onStepChange(getCurrentStep());
}

function handlePreviousStep() {
    previousStep();
    onStepChange(getCurrentStep());
}

function handleGoToStep(step) {
    goToStep(step);
    onStepChange(getCurrentStep());
}

function onStepChange(step) {
    // Step 2 = "ERC20MAX Configuration", where payment methods & fees are shown
    if (step === 2) {
        initPaymentMethods();
    }
}


// =====================================================
// WALLET CONNECT (button click handler)
// =====================================================

async function handleConnectWallet() {

    try {

        const result = await connectWallet();

        state.wallet.connected = true;
        state.wallet.address = result.account;

        let balance = "0";
        try {
            balance = await getFormattedBalance(result.account);
        } catch (balErr) {
            console.warn("Balance fetch failed:", balErr);
        }

        setWalletConnected({
            address: result.account,
            provider: result.walletName || getWalletName() || "EVM Wallet",
            network: result.network?.name || getNetwork()?.name || "-",
            balance
        });

        showToast({
            title: "Wallet connected",
            message: `Connected as ${result.account}`,
            variant: "success"
        });

        // If we're already on the payment-methods step, refresh them
        // now that we have a signer.
        if (getCurrentStep() === 2) {
            initPaymentMethods();
        }

    } catch (err) {

        console.error("Wallet connect error:", err);

        showToast({
            title: "Connection failed",
            message: err?.message || "Could not connect wallet. Make sure you have an EVM wallet installed.",
            variant: "error"
        });
    }
}


// =====================================================
// PAYMENT METHODS
// =====================================================

async function initPaymentMethods() {

    const cards = document.getElementById("paymentCards");
    if (cards) {
        cards.innerHTML = `
          <div class="paymentLoading">
            <svg class="spinnerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <span>Loading payment methods from contract...</span>
          </div>`;
    }

    try {
        await loadPaymentMethods();
        renderPaymentCards("paymentCards", (pm) => {
            // Update hint
            const hint = document.getElementById("paymentHint");
            if (hint) {
                if (pm.isNative) {
                    hint.textContent = `Pay ${formatUnits(pm.fee, 18)} ${pm.symbol} native coin directly from your wallet.`;
                } else {
                    hint.textContent = `Pay with ${pm.symbol} ERC-20 token. A gasless EIP-712 permit signature will be requested.`;
                }
            }
            // Update preview fee
            const feeEl = document.getElementById("previewFee");
            if (feeEl) {
                const feeNum = parseFloat(formatUnits(pm.fee, 18));
                feeEl.textContent = feeNum === 0 ? "Free" : `${feeNum % 1 === 0 ? feeNum.toFixed(0) : feeNum.toPrecision(6)} ${pm.symbol}`;
            }
        });
    } catch (err) {
        if (cards) {
            cards.innerHTML = '<div class="paymentEmpty"><p>Could not load payment methods.<br>Make sure your wallet is connected and you are on the right network.</p></div>';
        }
        console.error("Payment init error:", err);
    }
}


// =====================================================
// FEE CALCULATOR
// =====================================================

async function openFeeCalculator() {

    openModal({
        title: "Fee Calculator",
        bodyHTML: `
          <p class="feeCalcIntro">Live deploy fees pulled directly from the factory contract on EVOZ Mainnet. Pick any option during checkout — fees below already include the current on-chain rate.</p>
          <div class="feeCalcLoading">
            <svg class="spinnerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <span>Fetching current fees...</span>
          </div>`,
        showFooter: false
    });

    try {

        let methods = getLoadedMethods();

        if (!methods.length) {
            methods = await loadPaymentMethods();
        }

        const body = document.getElementById("modalBody");
        if (!body) return;

        if (!methods.length) {
            body.innerHTML = `
              <p class="feeCalcIntro">Live deploy fees pulled directly from the factory contract on EVOZ Mainnet.</p>
              <div class="feeCalcEmpty">No payment methods are configured on this network yet.</div>`;
            return;
        }

        const rows = methods.map(pm => {
            const feeNum = parseFloat(pm.feeFormatted);
            const feeDisplay = feeNum === 0
                ? "Free"
                : `${feeNum % 1 === 0 ? feeNum.toFixed(0) : feeNum.toPrecision(6)} ${pm.symbol}`;
            const badge = pm.isNative ? "Native Coin" : "ERC-20";
            return `
              <div class="feeCalcRow">
                <span class="feeCalcRow__symbol">${pm.symbol} <span class="feeCalcRow__badge">${badge}</span></span>
                <span class="feeCalcRow__value">${feeDisplay}</span>
              </div>`;
        }).join("");

        body.innerHTML = `
          <p class="feeCalcIntro">Live deploy fees pulled directly from the factory contract on EVOZ Mainnet. Pick any option during checkout.</p>
          <div class="feeCalcList">${rows}</div>`;

        if (window.lucide) lucide.createIcons();

    } catch (err) {

        console.error("Fee calculator error:", err);

        const body = document.getElementById("modalBody");
        if (body) {
            body.innerHTML = `<div class="feeCalcError">Could not fetch fees. Make sure your wallet is connected and you are on the right network.</div>`;
        }
    }
}


})(window.LF, window.ethers);
