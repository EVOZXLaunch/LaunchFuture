// =====================================================
// LaunchFuture
// Wallet Manager
// =====================================================

import {
    
    getProvider,

    getSigner,

    clearSession,

    getNativeBalance

} from "./blockchain.js";

// =====================================================
// Storage
// =====================================================

const STORAGE_KEY =
    "launchfuture.wallet";

// =====================================================
// State
// =====================================================

let account = null;

let chainId = null;

let connected = false;

let walletName = null;

let network = null;

let connectedAt = null;

// =====================================================
// Connect
// =====================================================

export async function connectWallet() {

    if (!window.ethereum) {

        throw new Error(
            "EVM wallet not detected."
        );

    }

    const provider =
        await getProvider();

    const accounts =
        await provider.send(

            "eth_requestAccounts",

            []

        );

    account =
        accounts[0] ?? null;

    const currentNetwork =
        await provider.getNetwork();

    chainId =
        Number(
            currentNetwork.chainId
        );

    network = {

        chainId,

        name:
            currentNetwork.name

    };

    walletName =
        detectWallet();

    connectedAt =
        Date.now();

    connected =
        account !== null;

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            connected,

            account,

            chainId,

            walletName,

            network,

            connectedAt

        })

    );

    return {

        connected,

        account,

        chainId,

        walletName,

        network,

        connectedAt

    };

}

// =====================================================
// Wallet Detection
// =====================================================

function detectWallet() {

    const ethereum =
        window.ethereum;

    if (!ethereum) {

        return "Unknown";

    }

    if (ethereum.isTokenPocket) {

        return "TokenPocket";

    }

    if (ethereum.isOKXWallet) {

        return "OKX";

    }

    if (ethereum.isRabby) {

        return "Rabby";

    }

    if (ethereum.isBitgetWallet) {

        return "Bitget";

    }

    if (ethereum.isMetaMask) {

        return "MetaMask";

    }

    return "EVM Wallet";

}

// =====================================================
// Disconnect
// =====================================================

export function disconnectWallet() {

    account = null;

    chainId = null;

    connected = false;

    walletName = null;

    network = null;

    connectedAt = null;

    clearSession();

    localStorage.removeItem(

        STORAGE_KEY

    );

}

// =====================================================
// Restore Connection
// =====================================================

export async function restoreConnection() {

    const saved =

        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {

        return false;

    }

    if (!window.ethereum) {

        return false;

    }

    const provider =
        await getProvider();

    const accounts =
        await provider.send(

            "eth_accounts",

            []

        );

    if (

        accounts.length === 0

    ) {

        disconnectWallet();

        return false;

    }

    account =
        accounts[0];

    const currentNetwork =
        await provider.getNetwork();

    chainId =
        Number(
            currentNetwork.chainId
        );

    network = {

        chainId,

        name:
            currentNetwork.name

    };

    walletName =
        detectWallet();

    connectedAt =
        Date.now();

    connected = true;

    return true;

}

// =====================================================
// Switch Network
// =====================================================

export async function switchNetwork(
    chainId
) {

    if (!window.ethereum) {

        throw new Error(
            "Wallet provider not found."
        );

    }

    await window.ethereum.request({

        method:
            "wallet_switchEthereumChain",

        params: [{

            chainId:
                `0x${Number(chainId).toString(16)}`

        }]

    });

}

// =====================================================
// Wallet Events
// =====================================================

export function registerWalletEvents(
    callbacks = {}
) {

    if (!window.ethereum) {

        return;

    }

    const {

        onAccountsChanged,

        onChainChanged,

        onDisconnect

    } = callbacks;

    window.ethereum.on(

        "accountsChanged",

        accounts => {

            account =
                accounts[0] ?? null;

            connected =
                account !== null;

            if (

                typeof onAccountsChanged ===
                "function"

            ) {

                onAccountsChanged(
                    account
                );

            }

        }

    );

    window.ethereum.on(

        "chainChanged",

        chain => {

            chainId =
                Number(chain);

            if (

                typeof onChainChanged ===
                "function"

            ) {

                onChainChanged(
                    chainId
                );

            }

        }

    );

    window.ethereum.on(

        "disconnect",

        error => {

            disconnectWallet();

            if (

                typeof onDisconnect ===
                "function"

            ) {

                onDisconnect(
                    error
                );

            }

        }

    );

}

// =====================================================
// Getters
// =====================================================

export function isConnected() {

    return connected;

}

export function getAccount() {

    return account;

}

export function getChainId() {

    return chainId;

}

export function getWalletName() {

    return walletName;

}

export function getNetwork() {

    return network;

}

export function getConnectedAt() {

    return connectedAt;

}

// =====================================================
// Balance
// =====================================================

export async function getBalance() {

    if (!connected) {

        return 0n;

    }

    return await getNativeBalance(
        account
    );

}

// =====================================================
// Wallet Info
// =====================================================

export function getWallet() {

    return {

        connected,

        account,

        chainId,

        walletName,

        network,

        connectedAt

    };

}

export async function provider() {

    return await getProvider();

}

export async function signer() {

    return await getSigner();

}

export default {

    connectWallet,

    disconnectWallet,

    restoreConnection,

    switchNetwork,

    registerWalletEvents,

    isConnected,

    getAccount,

    getChainId,

    getWalletName,

    getNetwork,

    getConnectedAt,

    getBalance,

    getWallet,

    provider,

    signer

};

// Re-export getFormattedBalance for convenience
export { getFormattedBalance } from "./blockchain.js";
