window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// LaunchFuture
// Blockchain Engine
// =====================================================

const { BrowserProvider, Contract, parseUnits, formatUnits, formatEther, isAddress, ZeroAddress, MaxUint256 } = ethers;
const { RPC, SECURITY } = LF.config;
// =====================================================
// State
// =====================================================

let provider = null;

let signer = null;

// =====================================================
// Validation
// =====================================================

function validateAddress(
    address,
    label = "Address"
) {

    if (

        !SECURITY.strictAddress

    ) {

        return;

    }

    if (

        !isAddress(
            address
        )

    ) {

        throw new Error(

            `${label} is invalid.`

        );

    }

}

// =====================================================
// Request
// =====================================================

async function withTimeout(
    promise,
    timeout = RPC.timeout
) {

    return await Promise.race([

        promise,

        new Promise((_, reject) =>

            setTimeout(

                () => reject(

                    new Error(
                        "RPC request timeout."
                    )

                ),

                timeout

            )

        )

    ]);

}

// =====================================================
// Provider
// =====================================================

async function getProvider() {

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

async function getSigner() {

    if (signer)
        return signer;

    const currentProvider =
        await getProvider();

    signer =
        await withTimeout(

            currentProvider.getSigner()

       );
    
    return signer;

}

// =====================================================
// Refresh Signer
// =====================================================

function clearSession() {

    provider = null;

    signer = null;

}

// =====================================================
// Native Balance
// =====================================================

async function getNativeBalance(
    address
) {

    if (!address) {

        return 0n;

    }

    validateAddress(
        address,
        "Wallet"
    );

    const currentProvider =
        await getProvider();

    return await withTimeout(

       currentProvider.getBalance(
           address
       )

    );

}

async function getFormattedBalance(
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

async function getContract(
    address,
    abi,
    readOnly = false
) {

    validateAddress(
        address,
        "Contract"
    );

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

async function getERC20Balance(

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

    return await withTimeout(

       contract.balanceOf(

           account

       )

    );

}

async function getERC20Allowance(

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

    return await withTimeout(

       contract.allowance(

           owner,

           spender

       )

     );

}

// =====================================================
// Transaction
// =====================================================

async function waitTransaction(
    tx,
    confirmations = 1
) {

    return await withTimeout(

       tx.wait(

          confirmations

       )

    );

}

// =====================================================
// Unit
// =====================================================



// =====================================================
// Address
// =====================================================



// =====================================================
// Export
// =====================================================

LF.blockchain = {

    parseUnits,

    formatUnits,

    isAddress,

    ZeroAddress,

    MaxUint256,


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

})(window.LF, window.ethers);
