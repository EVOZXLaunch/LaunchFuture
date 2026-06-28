// =====================================================
// LaunchFuture
// Blockchain Engine
// =====================================================

import {
    
    BrowserProvider,

    Contract,

    parseUnits,

    formatUnits,

    formatEther,

    isAddress,

    ZeroAddress,

    MaxUint256

} from "https://esm.sh/ethers@6";

// =====================================================
// State
// =====================================================

let provider = null;

let signer = null;

// =====================================================
// Provider
// =====================================================

export async function getProvider() {

    if (provider)
        return provider;

    if (!window.ethereum) {

        throw new Error(
            "Wallet provider not found."
        );

    }

    provider =
        new BrowserProvider(
            window.ethereum
        );

    return provider;

}

// =====================================================
// Signer
// =====================================================

export async function getSigner() {

    if (signer)
        return signer;

    const currentProvider =
        await getProvider();

    signer =
        await currentProvider.getSigner();

    return signer;

}

// =====================================================
// Refresh Signer
// =====================================================

export function clearSession() {

    provider = null;

    signer = null;

}

// =====================================================
// Native Balance
// =====================================================

export async function getNativeBalance(
    address
) {

    if (!address) {

        return 0n;

    }

    const currentProvider =
        await getProvider();

    return await currentProvider.getBalance(
        address
    );

}

export async function getFormattedBalance(
    address,
    decimals = 4
) {

    const balance =
        await getNativeBalance(
            address
        );

    return Number(

        formatEther(
            balance
        )

    ).toFixed(
        decimals
    );

}

// =====================================================
// Contract
// =====================================================

export async function getContract(
    address,
    abi,
    readOnly = false
) {

    if (readOnly) {

        const currentProvider =
            await getProvider();

        return new Contract(

            address,

            abi,

            currentProvider

        );

    }

    const currentSigner =
        await getSigner();

    return new Contract(

        address,

        abi,

        currentSigner

    );

}

// =====================================================
// ERC20
// =====================================================

export async function getERC20Balance(

    token,

    account

) {

    const contract =

        await getContract(

            token,

            [

                "function balanceOf(address) view returns (uint256)"

            ],

            true

        );

    return await contract.balanceOf(

        account

    );

}

export async function getERC20Allowance(

    token,

    owner,

    spender

) {

    const contract =

        await getContract(

            token,

            [

                "function allowance(address,address) view returns (uint256)"

            ],

            true

        );

    return await contract.allowance(

        owner,

        spender

    );

}

// =====================================================
// Transaction
// =====================================================

export async function waitTransaction(
    tx,
    confirmations = 1
) {

    return await tx.wait(
        confirmations
    );

}

// =====================================================
// Unit
// =====================================================

export {

    parseUnits,

    formatUnits

};

// =====================================================
// Address
// =====================================================

export {

    isAddress,

    ZeroAddress,

    MaxUint256

};

// =====================================================
// Export
// =====================================================

export default {

    getProvider,

    getSigner,

    getNativeBalance,

    getFormattedBalance,

    getERC20Balance,

    getERC20Allowance,

    getContract,

    waitTransaction,

    clearSession,

    parseUnits,

    formatUnits,

    isAddress,

    ZeroAddress,

    MaxUint256

};
