// =====================================================
// LaunchFuture
// Main Controller — Integrated & Fixed
// =====================================================

import {
    initUI,
    setWalletConnected,
    setWalletDisconnected,
    showStep,
    nextStep,
    getCurrentStep
} from "./ui.js";

import {
    restoreConnection,
    isConnected,
    getAccount,
    connectWallet,
    disconnectWallet,
    registerWalletEvents,
    getFormattedBalance
} from "./wallet.js";

import {
    getERC20Balance,
    getERC20Allowance,
    formatUnits
} from "./blockchain.js";

import { initDateTime } from "./datetime.js";

import {
    buildTokenConfig,
    buildMetadata,
    estimateDeployFee,
    deployToken,
    buildVerifyPackage,
    DEPLOY_STATUS,
    getDeployStatus
} from "./deploy.js";

import { isSymbolAvailable } from "./factory.js";

import {
    getWizardData,
    setTokenData,
    setMetadataData,
    setFeatureData,
    setPaymentData,
    loadWizard
} from "./wizard.js";

import { getReviewSummary, getReviewStatus } from "./review.js";
import { getCurrentNetwork, setCurrentNetwork, getSupportedNetworks } from "./networks/index.js";
import FEATURES from "./features.js";
import { CONTRACTS } from "./config.js";

// =====================================================
// Application State
// =====================================================

const appState = {
    config: null,
    metadata: null,
    payment: null,
    deployResult: null,
    verifyPackage: null
};

// =====================================================
// Helpers
// =====================================================

function clearDeployment() {
    appState.deployResult = null;
    appState.verifyPackage = null;
}

function logConsole(message, type = "info") {
    const console_ = document.getElementById("deployConsole");
    if (!console_) return;
    const line = document.createElement("div");
    line.className = `consoleLine console-${type}`;
    const time = new Date().toLocaleTimeString();
    line.textContent = `[${time}] ${message}`;
    console_.appendChild(line);
    console_.scrollTop = console_.scrollHeight;
}

// =====================================================
// Initialize
// =====================================================

async function initialize() {
    try {
        await initializeApplication();
    } catch (error) {
        console.error(error);
    }
}

async function initializeApplication() {
    initUI();
    restoreTheme();
    renderFeatures();
    bindFeatureEvents();
    updateFeatureVisibility();
    bindEvents();
    initDateTime();
    restoreWizard();
    initNetworkSelector();
    syncPaymentFromNetwork();
    await refreshApplication();
    await initializeWallet();
}

// =====================================================
// Network Selector
// =====================================================

function initNetworkSelector() {
    const networkButton = document.getElementById("networkButton");
    if (!networkButton) return;

    // Build dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "networkDropdown";
    dropdown.className = "networkDropdown hidden";

    const networks = getSupportedNetworks();
    networks.forEach(net => {
        const item = document.createElement("button");
        item.className = "networkItem";
        item.dataset.key = net.key;
        item.textContent = net.name;
        if (net.status !== "live") {
            item.disabled = true;
            item.textContent += " (soon)";
        }
        item.addEventListener("click", () => {
            selectNetwork(net.key);
            dropdown.classList.add("hidden");
        });
        dropdown.appendChild(item);
    });

    networkButton.parentNode.insertBefore(dropdown, networkButton.nextSibling);

    networkButton.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
        dropdown.classList.add("hidden");
    });

    updateNetworkButton();
}

function selectNetwork(key) {
    try {
        setCurrentNetwork(key);
        syncPaymentFromNetwork();
        updateNetworkButton();
        refreshApplication();
    } catch (e) {
        console.error(e);
    }
}

function updateNetworkButton() {
    const label = document.getElementById("networkButtonLabel");
    const net = getCurrentNetwork();
    if (label) label.textContent = net.name || net.symbol;
}

// =====================================================
// Sync Payment from Current Network
// =====================================================

function syncPaymentFromNetwork() {
    const net = getCurrentNetwork();
    // Default to native payment using the network's currency
    setPaymentData({
        type: "NATIVE",
        symbol: net.currency.symbol,
        decimals: net.currency.decimals,
        network: net.key
    });
}

// =====================================================
// Wallet
// =====================================================

async function initializeWallet() {
    try {
        await restoreConnection();

        if (isConnected()) {
            await onWalletConnected(getAccount());
        } else {
            setWalletDisconnected();
        }

        registerWalletEvents({
            onAccountsChanged: async (account) => {
                if (account) {
                    await onWalletConnected(account);
                } else {
                    onWalletDisconnected();
                }
            },
            onChainChanged: async () => {
                window.location.reload();
            },
            onDisconnect: () => {
                onWalletDisconnected();
            }
        });

    } catch (error) {
        console.error(error);
        setWalletDisconnected();
    }
}

async function onWalletConnected(account) {
    setWalletConnected(account);
    // Auto-fill owner field
    if (tokenOwner) tokenOwner.value = account;
    setTokenData({ owner: account });
    // Update wallet info panel
    await updateWalletInfo(account);
    refreshApplication();
}

function onWalletDisconnected() {
    setWalletDisconnected();
    if (tokenOwner) tokenOwner.value = "";
    setTokenData({ owner: "" });
    // Reset wallet info
    const ids = ["nativeBalance", "lftBalance", "lftAllowance", "walletNetwork"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "--";
    });
    refreshApplication();
}

async function updateWalletInfo(account) {
    const net = getCurrentNetwork();
    const contracts = CONTRACTS[net.key];

    // Network name
    const walletNetworkEl = document.getElementById("walletNetwork");
    if (walletNetworkEl) walletNetworkEl.textContent = net.name;

    // Native balance
    try {
        const bal = await getFormattedBalance(account);
        const nativeBalEl = document.getElementById("nativeBalance");
        if (nativeBalEl) nativeBalEl.textContent = `${bal} ${net.currency.symbol}`;
    } catch (_) {}

    // LFT balance
    try {
        if (contracts?.utilityToken) {
            const lftRaw = await getERC20Balance(contracts.utilityToken, account);
            const lftFmt = Number(formatUnits(lftRaw, 18)).toFixed(2);
            const lftBalEl = document.getElementById("lftBalance");
            if (lftBalEl) lftBalEl.textContent = `${lftFmt} LFT`;

            // Allowance
            if (contracts?.factory) {
                const allowRaw = await getERC20Allowance(contracts.utilityToken, account, contracts.factory);
                const allowFmt = Number(formatUnits(allowRaw, 18)).toFixed(2);
                const lftAllowEl = document.getElementById("lftAllowance");
                if (lftAllowEl) lftAllowEl.textContent = `${allowFmt} LFT`;
            }
        }
    } catch (_) {}
}

// =====================================================
// Elements
// =====================================================

const walletButton = document.getElementById("walletButton");
const connectWalletButton = document.getElementById("connectWalletButton");
const disconnectWalletButton = document.getElementById("disconnectWalletButton");
const copyWalletButton = document.getElementById("copyWalletButton");
const deployButton = document.getElementById("deployButton");

const tokenName = document.getElementById("tokenName");
const tokenSymbol = document.getElementById("tokenSymbol");
const tokenSupply = document.getElementById("tokenSupply");
const tokenDecimals = document.getElementById("tokenDecimals");
const tokenOwner = document.getElementById("tokenOwner");

const previewName = document.getElementById("previewName");
const previewSymbol = document.getElementById("previewSymbol");
const previewSupply = document.getElementById("previewSupply");
const previewDecimals = document.getElementById("previewDecimals");
const previewFeatures = document.getElementById("previewFeatures");
const previewNetwork = document.getElementById("previewNetwork");

const website = document.getElementById("website");
const telegram = document.getElementById("telegram");
const twitter = document.getElementById("twitter");
const logoURI = document.getElementById("logoURI");

const reviewContent = document.getElementById("reviewContent");
const previewFee = document.getElementById("previewFee");
const symbolStatus = document.getElementById("symbolStatus");

// =====================================================
// Events
// =====================================================

function bindEvents() {
    walletButton?.addEventListener("click", handleWalletButtonClick);
    connectWalletButton?.addEventListener("click", handleConnectWallet);
    disconnectWalletButton?.addEventListener("click", handleDisconnectWallet);
    copyWalletButton?.addEventListener("click", handleCopyWallet);
    deployButton?.addEventListener("click", handleDeploy);

    // Wallet picker grid (MetaMask, OKX, TokenPocket, Bitget, Rabby)
    document.querySelectorAll(".walletPickBtn").forEach(btn => {
        btn.addEventListener("click", handleConnectWallet);
    });

    // Token inputs
    tokenName?.addEventListener("input", syncTokenData);
    tokenSymbol?.addEventListener("input", () => { syncTokenData(); scheduleSymbolCheck(); });
    tokenSupply?.addEventListener("input", syncTokenData);
    tokenDecimals?.addEventListener("change", syncTokenData);

    // Metadata inputs
    website?.addEventListener("input", syncMetadata);
    telegram?.addEventListener("input", syncMetadata);
    twitter?.addEventListener("input", syncMetadata);
    logoURI?.addEventListener("input", syncMetadata);

    // Wizard step navigation (Back / Continue buttons in every step footer)
    document.querySelectorAll('[data-nav="prev"]').forEach(btn => {
        btn.addEventListener("click", () => showStep(getCurrentStepNum() - 1));
    });
    document.querySelectorAll('[data-nav="next"]').forEach(btn => {
        btn.addEventListener("click", () => showStep(getCurrentStepNum() + 1));
    });

    // Clicking a step circle jumps directly to that step
    document.querySelectorAll(".wizardStep").forEach(stepEl => {
        stepEl.addEventListener("click", () => {
            const step = Number(stepEl.dataset.step);
            if (step) showStep(step);
        });
    });

    // Theme toggle
    document.getElementById("themeToggle")?.addEventListener("change", handleThemeToggle);

    // Fee calculator modal
    document.getElementById("feeCalculatorButton")?.addEventListener("click", openFeeCalculator);
    document.getElementById("feeCalculatorClose")?.addEventListener("click", closeFeeCalculator);
    document.getElementById("feeCalculatorModal")?.addEventListener("click", (e) => {
        if (e.target.id === "feeCalculatorModal") closeFeeCalculator();
    });

    // Feature search
    document.getElementById("featureSearch")?.addEventListener("input", handleFeatureSearch);
}

// =====================================================
// Theme
// =====================================================

function handleThemeToggle(e) {
    const light = e.target.checked;
    document.body.classList.toggle("themeLight", light);
    try { localStorage.setItem("launchfuture.theme", light ? "light" : "dark"); } catch (_) {}
}

function restoreTheme() {
    let saved = null;
    try { saved = localStorage.getItem("launchfuture.theme"); } catch (_) {}
    const light = saved === "light";
    document.body.classList.toggle("themeLight", light);
    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.checked = light;
}

// =====================================================
// Fee Calculator Modal
// =====================================================

function openFeeCalculator() {
    const modal = document.getElementById("feeCalculatorModal");
    if (!modal) return;

    const wizard = getWizardData();
    const net = getCurrentNetwork();
    const enabledCount = FEATURES.filter(f => {
        const el = document.getElementById(f.id);
        if (!el) return false;
        return f.type === "boolean" ? el.checked : (el.value && el.value !== "");
    }).length;

    const baseFee = 0.01;
    const perFeature = 0.002;
    const total = baseFee + (enabledCount * perFeature);
    const symbol = wizard.payment?.symbol || net.currency.symbol;

    const feeCalcNetwork = document.getElementById("feeCalcNetwork");
    const feeCalcBase = document.getElementById("feeCalcBase");
    const feeCalcFeatures = document.getElementById("feeCalcFeatures");
    const feeCalcTotal = document.getElementById("feeCalcTotal");

    if (feeCalcNetwork) feeCalcNetwork.textContent = net.name;
    if (feeCalcBase) feeCalcBase.textContent = `${baseFee} ${symbol}`;
    if (feeCalcFeatures) feeCalcFeatures.textContent = `${(enabledCount * perFeature).toFixed(3)} ${symbol} (${enabledCount} features)`;
    if (feeCalcTotal) feeCalcTotal.textContent = `${total.toFixed(3)} ${symbol}`;

    modal.classList.remove("hidden");
}

function closeFeeCalculator() {
    document.getElementById("feeCalculatorModal")?.classList.add("hidden");
}

function getCurrentStepNum() { return getCurrentStep(); }

// =====================================================
// Wallet Button Handler
// =====================================================

function handleWalletButtonClick() {
    if (isConnected()) {
        handleDisconnectWallet();
    } else {
        handleConnectWallet();
    }
}

// =====================================================
// Symbol Validation (debounced)
// =====================================================

let symbolTimer = null;
function scheduleSymbolCheck() {
    clearTimeout(symbolTimer);
    symbolTimer = setTimeout(validateSymbol, 600);
}

async function validateSymbol() {
    const symbol = tokenSymbol?.value?.trim()?.toUpperCase();
    if (!symbol || symbol.length < 2) {
        if (symbolStatus) symbolStatus.textContent = "-";
        return;
    }
    if (symbolStatus) symbolStatus.textContent = "Checking...";
    try {
        const available = await isSymbolAvailable(symbol);
        if (symbolStatus) symbolStatus.textContent = available ? "✅ Available" : "❌ Taken";
    } catch (_) {
        if (symbolStatus) symbolStatus.textContent = "⚠ Error";
    }
}

// =====================================================
// Feature Search
// =====================================================

function handleFeatureSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll(".featureRow");
    rows.forEach(row => {
        const label = row.querySelector("label")?.textContent?.toLowerCase() ?? "";
        row.style.display = (!query || label.includes(query)) ? "" : "none";
    });
    // Show/hide group headers based on visible children
    document.querySelectorAll(".featureGroup").forEach(group => {
        const content = group.querySelector(".featureContent");
        const visible = [...(content?.querySelectorAll(".featureRow") ?? [])].some(r => r.style.display !== "none");
        group.style.display = visible ? "" : "none";
    });
}

// =====================================================
// Fee Preview
// =====================================================

async function updateDeployFee() {
    try {
        const wizard = getWizardData();
        const payment = wizard.payment;
        if (!payment?.symbol) {
            if (previewFee) previewFee.textContent = "--";
            return;
        }
        const fee = await estimateDeployFee(payment);
        if (previewFee) previewFee.textContent = `${fee} ${payment.symbol}`;
    } catch (_) {
        if (previewFee) previewFee.textContent = "--";
    }
}

// =====================================================
// Token Health
// =====================================================

function updateTokenHealth() {
    const healthFill = document.getElementById("healthFill");
    const healthPercent = document.getElementById("healthPercent");
    const healthStatus = document.getElementById("healthStatus");
    if (!healthFill || !healthPercent || !healthStatus) return;

    const name = tokenName?.value?.trim() ?? "";
    const symbol = tokenSymbol?.value?.trim() ?? "";
    const supply = tokenSupply?.value?.trim() ?? "";
    const owner = tokenOwner?.value?.trim() ?? "";

    let score = 0;
    const messages = [];

    if (name.length >= 2) score += 25; else messages.push("Token name required.");
    if (symbol.length >= 2) score += 25; else messages.push("Token symbol required.");
    if (supply && Number(supply) > 0) score += 25; else messages.push("Supply required.");
    if (owner && owner.startsWith("0x")) score += 25; else messages.push("Wallet not connected.");

    healthFill.style.width = `${score}%`;
    healthFill.style.background = score >= 75 ? "var(--success, #22c55e)" : score >= 50 ? "var(--warning, #f59e0b)" : "var(--primary)";
    healthPercent.textContent = `${score}%`;
    healthStatus.textContent = score === 100 ? "Token looks great!" : messages[0] ?? "Fill in all fields.";
}

// =====================================================
// Refresh UI
// =====================================================

async function refreshApplication() {
    updatePreview();
    updateReview();
    updateTokenHealth();
    await updateDeployFee();
}

// =====================================================
// Feature Renderer
// =====================================================

function renderFeatures() {
    const groups = document.querySelectorAll(".featureGroup");
    groups.forEach(group => {
        const category = group.querySelector("summary").textContent.trim().toLowerCase();
        const container = group.querySelector(".featureContent");
        container.innerHTML = "";

        FEATURES.filter(f => f.category === category).forEach(feature => {
            let input = "";
            switch (feature.type) {
                case "boolean":
                    input = `<input type="checkbox" id="${feature.id}">`;
                    break;
                case "number":
                    input = `<input type="number" id="${feature.id}" min="0">`;
                    break;
                case "percentage":
                    input = `<input type="number" min="0" max="100" id="${feature.id}" placeholder="0">`;
                    break;
                case "address":
                    input = `<input type="text" id="${feature.id}" placeholder="0x...">`;
                    break;
                case "url":
                    input = `<input type="url" id="${feature.id}" placeholder="https://">`;
                    break;
                default:
                    input = `<input type="text" id="${feature.id}">`;
            }
            container.insertAdjacentHTML("beforeend",
                `<div class="featureRow">
                    <label for="${feature.id}">${feature.label}</label>
                    ${input}
                </div>`
            );
        });
    });
}

function bindFeatureEvents() {
    FEATURES.forEach(feature => {
        const element = document.getElementById(feature.id);
        if (!element) return;
        const event = feature.type === "boolean" ? "change" : "input";
        element.addEventListener(event, syncFeatures);
    });
}

function updateFeatureVisibility() {
    const visibility = {
        tradingDelaySeconds: "tradingDelay",
        antiBotBlocks: "antiBot",
        maxWalletPercent: "maxWalletEnabled",
        maxTxPercent: "maxTxEnabled",
        buyTax: "buyTaxEnabled",
        sellTax: "sellTaxEnabled",
        transferTax: "transferTaxEnabled",
        marketingWallet: "marketingShare",
        developmentWallet: "developmentShare",
        treasuryWallet: "treasuryShare",
        liquidityWallet: "liquidityShare",
        buybackWallet: "buybackShare",
        charityWallet: "charityShare"
    };

    Object.entries(visibility).forEach(([child, parent]) => {
        const parentInput = document.getElementById(parent);
        const childInput = document.getElementById(child);
        if (!parentInput || !childInput) return;
        const row = childInput.closest(".featureRow");
        if (!row) return;
        const visible = parentInput.type === "checkbox"
            ? parentInput.checked
            : Number(parentInput.value) > 0;
        row.style.display = visible ? "" : "none";
        if (!visible) {
            if (childInput.type === "checkbox") childInput.checked = false;
            else childInput.value = "";
        }
    });

    setTimeout(syncFeatures, 0);
}

// =====================================================
// Wizard Restore
// =====================================================

function restoreWizard() {
    if (!loadWizard()) return;
    const wizard = getWizardData();

    if (tokenName) tokenName.value = wizard.token.name ?? "";
    if (tokenSymbol) tokenSymbol.value = wizard.token.symbol ?? "";
    if (tokenSupply) tokenSupply.value = wizard.token.supply ?? "";
    if (tokenDecimals) tokenDecimals.value = wizard.token.decimals ?? 18;
    if (tokenOwner) tokenOwner.value = wizard.token.owner ?? "";

    if (website) website.value = wizard.metadata.website ?? "";
    if (telegram) telegram.value = wizard.metadata.telegram ?? "";
    if (twitter) twitter.value = wizard.metadata.twitter ?? "";
    if (logoURI) logoURI.value = wizard.metadata.logoURI ?? "";

    FEATURES.forEach(feature => {
        const element = document.getElementById(feature.id);
        if (!element) return;
        const value = wizard.features?.[feature.id];
        if (feature.type === "boolean") element.checked = Boolean(value);
        else element.value = value ?? "";
    });

    updateFeatureVisibility();
}

// =====================================================
// Sync Functions
// =====================================================

function syncTokenData() {
    setTokenData({
        name: tokenName?.value ?? "",
        symbol: tokenSymbol?.value ?? "",
        supply: tokenSupply?.value ?? "",
        decimals: Number(tokenDecimals?.value ?? 18),
        owner: tokenOwner?.value ?? ""
    });
    refreshApplication();
}

function syncMetadata() {
    setMetadataData({
        website: website?.value ?? "",
        telegram: telegram?.value ?? "",
        twitter: twitter?.value ?? "",
        logoURI: logoURI?.value ?? ""
    });
    refreshApplication();
}

function syncFeatures() {
    const features = {};
    FEATURES.forEach(feature => {
        const element = document.getElementById(feature.id);
        if (!element) return;
        switch (feature.type) {
            case "boolean":
                features[feature.id] = element.checked;
                break;
            case "number":
            case "percentage":
                features[feature.id] = element.value === "" ? null : Number(element.value);
                break;
            default:
                features[feature.id] = element.value;
        }
    });
    setFeatureData(features);
    updateFeatureVisibility();
    refreshApplication();
}

// =====================================================
// Review
// =====================================================

function updateReview() {
    if (!reviewContent) return;
    const review = getReviewSummary();
    const status = getReviewStatus();
    const net = getCurrentNetwork();

    const warningHtml = status.warnings.length > 0
        ? `<div class="reviewWarnings"><ul>${status.warnings.map(w => `<li>⚠ ${w}</li>`).join("")}</ul></div>`
        : "";

    reviewContent.innerHTML = `
        <div class="reviewGrid">
            <div><strong>Network</strong><p>${net.name}</p></div>
            <div><strong>Token</strong><p>${review.token.name || "-"}</p></div>
            <div><strong>Symbol</strong><p>${review.token.symbol || "-"}</p></div>
            <div><strong>Supply</strong><p>${review.token.supply || "-"}</p></div>
            <div><strong>Decimals</strong><p>${getWizardData().token.decimals ?? 18}</p></div>
            <div><strong>Features</strong><p>${review.featureCount} Enabled</p></div>
            <div><strong>Payment</strong><p>${review.payment?.symbol || "-"}</p></div>
            <div><strong>Status</strong><p class="${status.ready ? 'statusReady' : 'statusWarn'}">${status.ready ? "✅ Ready" : "⚠ Incomplete"}</p></div>
        </div>
        ${warningHtml}
    `;
}

// =====================================================
// Live Preview
// =====================================================

function updatePreview() {
    if (previewName) previewName.textContent = tokenName?.value || "-";
    if (previewSymbol) previewSymbol.textContent = tokenSymbol?.value || "-";
    if (previewSupply) previewSupply.textContent = tokenSupply?.value || "-";
    if (previewDecimals) previewDecimals.textContent = tokenDecimals?.value || "18";
    if (previewNetwork) previewNetwork.textContent = getCurrentNetwork().name;

    // Count enabled features
    const totalFeatures = FEATURES.length;
    const enabledFeatures = FEATURES.filter(f => {
        const el = document.getElementById(f.id);
        if (!el) return false;
        if (f.type === "boolean") return el.checked;
        return el.value && el.value !== "";
    }).length;
    if (previewFeatures) previewFeatures.textContent = `${enabledFeatures}`;

    const badge = document.getElementById("previewFeaturesBadge");
    if (badge) badge.textContent = `${enabledFeatures}/${totalFeatures} Enabled`;

    const symbolBig = document.getElementById("previewTokenSymbolBig");
    if (symbolBig) {
        const sym = (tokenSymbol?.value || "").trim();
        if (sym) {
            symbolBig.innerHTML = `<span>${sym.toUpperCase()}</span>`;
        } else {
            symbolBig.innerHTML = `ERC20<span>MAX</span>`;
        }
    }
}

// =====================================================
// Deploy
// =====================================================

async function prepareDeployment() {
    clearDeployment();
    const wizard = getWizardData();
    appState.config = buildTokenConfig({
        ...wizard.token,
        features: wizard.features
    });
    appState.metadata = buildMetadata(wizard.metadata);
    appState.payment = wizard.payment;
}

async function startDeployment() {
    appState.deployResult = await deployToken(
        appState.config,
        appState.metadata,
        appState.payment
    );
}

function finishDeployment() {
    appState.verifyPackage = buildVerifyPackage(
        appState.deployResult,
        appState.config,
        appState.metadata
    );
}

// =====================================================
// Event Handlers
// =====================================================

async function handleConnectWallet() {
    try {
        await connectWallet();
        await onWalletConnected(getAccount());
        nextStep();
    } catch (error) {
        console.error(error);
        logConsole(`Wallet error: ${error.message}`, "error");
    }
}

async function handleDisconnectWallet() {
    try {
        disconnectWallet();
        onWalletDisconnected();
    } catch (error) {
        console.error(error);
    }
}

async function handleCopyWallet() {
    try {
        const account = getAccount();
        if (!account) return;
        await navigator.clipboard.writeText(account);
        const btn = document.getElementById("copyWalletButton");
        if (btn) { btn.textContent = "✅"; setTimeout(() => btn.textContent = "📋", 1500); }
    } catch (error) {
        console.error(error);
    }
}

async function handleDeploy() {
    const deployStatus_ = document.getElementById("deployStatus");
    const console_ = document.getElementById("deployConsole");
    if (console_) console_.innerHTML = "";

    try {
        deployButton.disabled = true;
        deployButton.textContent = "Deploying...";

        if (deployStatus_) deployStatus_.textContent = "Validating...";
        logConsole("Starting deployment...", "info");

        await prepareDeployment();
        logConsole("Configuration validated.", "info");

        if (deployStatus_) deployStatus_.textContent = "Waiting for signature...";
        logConsole("Waiting for wallet signature...", "info");

        await startDeployment();
        finishDeployment();

        const result = appState.verifyPackage;
        if (deployStatus_) deployStatus_.textContent = "✅ Deployed!";
        logConsole(`✅ Success! Token deployed.`, "success");
        if (result?.tokenAddress) logConsole(`Token address: ${result.tokenAddress}`, "success");
        if (result?.txHash) logConsole(`Tx hash: ${result.txHash}`, "success");

        const net = getCurrentNetwork();
        if (result?.txHash && net.explorer?.url) {
            logConsole(`Explorer: ${net.explorer.url}/tx/${result.txHash}`, "success");
        }

    } catch (error) {
        console.error(error);
        if (document.getElementById("deployStatus")) {
            document.getElementById("deployStatus").textContent = "❌ Deployment failed.";
        }
        logConsole(`❌ Error: ${error.message || error}`, "error");
    } finally {
        deployButton.disabled = false;
        deployButton.textContent = "Deploy Token";
    }
}

// =====================================================
// Start
// =====================================================

initialize();
