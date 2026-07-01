window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// LaunchFuture
// Wallet Manager
// Part 1
// =====================================================

const { getProvider, getSigner: blockchainGetSigner, clearSession, getNativeBalance } = LF.blockchain;
const { CACHE } = LF.config;
// =====================================================
// Storage
// =====================================================

const STORAGE_KEY =
    CACHE.wallet;

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
// Storage Helpers
// =====================================================

function saveWalletState() {

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

}

function loadWalletState() {

    const saved =

        localStorage.getItem(

            STORAGE_KEY

        );

    return saved ?

        JSON.parse(

            saved

        )

        : null;

}

function clearWalletState() {

    localStorage.removeItem(

        STORAGE_KEY

    );

}

// =====================================================
// State Helpers
// =====================================================

function updateWalletState({

    account: newAccount,

    chainId: newChainId,

    network: newNetwork,

    walletName: newWalletName,

    connectedAt: newConnectedAt = Date.now()

}) {

    account =
        newAccount;

    chainId =
        newChainId;

    network =
        newNetwork;

    walletName =
        newWalletName;

    connectedAt =
        newConnectedAt;

    connected =
        Boolean(
            account
        );

}

function resetWalletState() {

    updateWalletState({

        account:
            null,

        chainId:
            null,

        network:
            null,

        walletName:
            null,

        connectedAt:
            null

    });

}

// =====================================================
// Refresh Wallet State
// =====================================================

async function refreshWalletState() {

    const provider =
        await getProvider();

    const accounts =
        await provider.send(

            "eth_accounts",

            []

        );

    const currentNetwork =
        await provider.getNetwork();

    updateWalletState({

        account:
            accounts[0] ?? null,

        chainId:
            Number(
                currentNetwork.chainId
            ),

        network: {

            chainId:
                Number(
                    currentNetwork.chainId
                ),

            name:
                currentNetwork.name

        },

        walletName:
            detectWallet()

    });

}

// =====================================================
// Connect
// =====================================================

async function connectWallet() {

    if (!window.ethereum) {

        throw new Error(
            "EVM wallet not detected."
        );

    }

    const provider =
    await getProvider();

await provider.send(

    "eth_requestAccounts",

    []

);

await refreshWalletState();

saveWalletState();

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

function disconnectWallet() {

    resetWalletState();

    clearSession();

    clearWalletState();

}

// =====================================================
// Restore Connection
// =====================================================

async function restoreConnection() {

    const saved =

        loadWalletState();

    if (!saved) {

        return false;

    }

    if (!window.ethereum) {

        return false;

    }

    await refreshWalletState();

    saveWalletState();

    return true;

}

// =====================================================
// Switch Network
// =====================================================

async function switchNetwork(
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

function registerWalletEvents(
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

        async accounts => {

    await refreshWalletState();

    saveWalletState();

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

    async () => {

        await refreshWalletState();

        saveWalletState();

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

function isConnected() {

    return connected;

}

function getAccount() {

    return account;

}

function getChainId() {

    return chainId;

}

function getWalletName() {

    return walletName;

}

function getNetwork() {

    return network;

}

function getConnectedAt() {

    return connectedAt;

}

// =====================================================
// Balance
// =====================================================

async function getBalance() {

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

function getWallet() {

    return {

        connected,

        account,

        chainId,

        walletName,

        network,

        connectedAt

    };

}

async function getWalletProvider() {

    return await getProvider();

}

async function getWalletSigner() {

    return await blockchainGetSigner();

}

async function getSigner() {

    return await blockchainGetSigner();

}

LF.wallet = {

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

    getWalletProvider,

    getWalletSigner,

    getSigner

};

})(window.LF, window.ethers);
