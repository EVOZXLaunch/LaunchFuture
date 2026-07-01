// =====================================================
// LaunchFuture
// Payment Method Manager
// Loads available fee options from factory contract
// and handles native (EVOZ) + ERC-20 permit (LFT) flows
// =====================================================

import { getFactory, getDeployFee, getPaymentMethod } from "./factory.js";
import { getCurrentNetwork } from "./networks/index.js";
import { formatUnits, parseUnits } from "ethers";

// =====================================================
// Known payment symbols to try loading
// Add more as you register them in the factory
// =====================================================

const CANDIDATE_SYMBOLS = ["EVOZ", "LFT", "USDT", "USDC", "BNB", "ETH", "DAI"];

// =====================================================
// State
// =====================================================

let loadedMethods   = [];   // [{symbol, isNative, fee, feeFormatted, token, exchange, enabled}]
let selectedSymbol  = null;

// =====================================================
// Load
// =====================================================

export async function loadPaymentMethods() {
    const network = getCurrentNetwork();
    const symbols = network.paymentSymbols ?? CANDIDATE_SYMBOLS;
    loadedMethods = [];

    for (const sym of symbols) {
        try {
            const pm = await getPaymentMethod(sym);
            if (!pm.enabled) continue;
            const [, , feeWei] = await getDeployFee(sym);
            const decimals = pm.isNative ? 18 : 18; // adjust if ERC-20 has different decimals
            loadedMethods.push({
                symbol:       sym,
                isNative:     pm.isNative,
                burnEnabled:  pm.burnEnabled,
                token:        pm.token,
                exchange:     pm.exchange,
                fee:          feeWei,
                feeFormatted: formatUnits(feeWei, decimals)
            });
        } catch {
            // symbol not registered, skip
        }
    }

    return loadedMethods;
}

// =====================================================
// Selection
// =====================================================

export function selectPayment(symbol) {
    selectedSymbol = symbol;
}

export function getSelectedPayment() {
    if (!selectedSymbol) return null;
    return loadedMethods.find(m => m.symbol === selectedSymbol) ?? null;
}

export function getLoadedMethods() {
    return loadedMethods;
}

// =====================================================
// Render Cards
// =====================================================

export function renderPaymentCards(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!loadedMethods.length) {
        container.innerHTML = `
          <div class="paymentEmpty">
            <p>No payment methods available on this network.<br>
            The admin needs to configure payment methods first.</p>
          </div>`;
        return;
    }

    container.innerHTML = "";

    loadedMethods.forEach(pm => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "paymentCard";
        card.dataset.symbol = pm.symbol;

        const icon = pm.isNative
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12l6-6 6 6"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4"/></svg>`;

        const typeBadge = pm.isNative
          ? `<span class="payBadge payBadge--native">Native Coin</span>`
          : `<span class="payBadge payBadge--token">ERC-20</span>`;

        const feeNum = parseFloat(pm.feeFormatted);
        const feeDisplay = feeNum === 0 ? "Free" : `${feeNum % 1 === 0 ? feeNum.toFixed(0) : feeNum.toPrecision(6)} ${pm.symbol}`;

        card.innerHTML = `
          <div class="payCard__icon">${icon}</div>
          <div class="payCard__body">
            <div class="payCard__top">
              <span class="payCard__sym">${pm.symbol}</span>
              ${typeBadge}
            </div>
            <div class="payCard__fee">
              <span class="payCard__feeLabel">Deploy Fee</span>
              <strong class="payCard__feeVal">${feeDisplay}</strong>
            </div>
            ${pm.burnEnabled ? '<div class="payCard__burn">🔥 Burn enabled</div>' : ''}
          </div>
          <div class="payCard__check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>`;

        card.addEventListener("click", () => {
            container.querySelectorAll(".paymentCard").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectPayment(pm.symbol);
            if (onSelect) onSelect(pm);
        });

        container.appendChild(card);
    });

    // Auto-select first
    if (loadedMethods.length > 0 && !selectedSymbol) {
        const first = container.querySelector(".paymentCard");
        first?.click();
    }
}

// =====================================================
// EIP-712 Permit for ERC-20 payment (LFT)
// =====================================================

export async function signPermit(signer, tokenContract, spender, value, deadline) {
    const owner      = await signer.getAddress();
    const nonce      = await tokenContract.nonces(owner);
    const domain     = {
        name:              await tokenContract.name(),
        version:           "1",
        chainId:           (await signer.provider.getNetwork()).chainId,
        verifyingContract: await tokenContract.getAddress()
    };
    const types = {
        Permit: [
            { name: "owner",    type: "address" },
            { name: "spender",  type: "address" },
            { name: "value",    type: "uint256" },
            { name: "nonce",    type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    };
    const message = { owner, spender, value, nonce, deadline };
    const sig     = await signer.signTypedData(domain, types, message);
    const r       = sig.slice(0, 66);
    const s       = "0x" + sig.slice(66, 130);
    const v       = parseInt(sig.slice(130, 132), 16);
    return { v, r, s, deadline };
}

export default {
    loadPaymentMethods,
    renderPaymentCards,
    selectPayment,
    getSelectedPayment,
    getLoadedMethods,
    signPermit
};
