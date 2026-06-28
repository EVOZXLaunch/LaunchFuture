// =====================================================
// LaunchFuture
// UI Manager
// =====================================================

// =====================================================
// Constants
// =====================================================

export const TOTAL_STEPS = 6;

// =====================================================
// State
// =====================================================

let currentStep = 1;

// =====================================================
// Elements
// =====================================================

const wizardSteps = [

    ...document.querySelectorAll(

        ".wizardStep"

    )

];

const wizardPages = [

    ...document.querySelectorAll(

        ".wizardPage"

    )

];

const progressValue =

    document.getElementById(

        "progressValue"

    );

const progressFill =

    document.getElementById(

        "progressFill"

    );

const walletButton =

    document.getElementById(

        "walletButton"

    );

const walletConnectView =

    document.getElementById(

        "walletConnectView"

    );

const walletInfoView =

    document.getElementById(

        "walletInfoView"

    );

const walletStatus =

    document.getElementById(

        "walletStatus"

    );

const walletAddress =

    document.getElementById(

        "walletAddress"

    );

// =====================================================
// Getters
// =====================================================

export function getCurrentStep() {

    return currentStep;

}

export function getTotalSteps() {

    return TOTAL_STEPS;

}

// =====================================================
// Wizard
// =====================================================

export function showStep(
    step
) {

    if (

        step < 1 ||

        step > TOTAL_STEPS

    ) {

        return;

    }

    currentStep =

        step;

    refreshWizard();

    updateProgress();

}

export function nextStep() {

    showStep(

        currentStep + 1

    );

}

export function previousStep() {

    showStep(

        currentStep - 1

    );

}

// =====================================================
// Wizard Refresh
// =====================================================

export function refreshWizard() {

    wizardSteps.forEach(

        (

            item,

            index

        ) => {

            item.classList.toggle(

                "active",

                index ===

                currentStep - 1

            );

            item.classList.toggle(

                "completed",

                index <

                currentStep - 1

            );

        }

    );

    wizardPages.forEach(

        (

            page,

            index

        ) => {

            page.classList.toggle(

                "active",

                index ===

                currentStep - 1

            );

        }

    );

}

// =====================================================
// Progress
// =====================================================

export function updateProgress() {

    if (

        !progressValue ||

        !progressFill

    ) {

        return;

    }

    const percent =

        Math.round(

            (

                currentStep

                /

                TOTAL_STEPS

            )

            * 100

        );

    progressValue.textContent =

        `${percent}%`;

    progressFill.style.width =

        `${percent}%`;

}

// =====================================================
// Wallet UI
// =====================================================

function showWalletConnect() {

    if (

        walletConnectView

    ) {

        walletConnectView.style.display =

            "block";

    }

    if (

        walletInfoView

    ) {

        walletInfoView.style.display =

            "none";

    }

}

function showWalletInfo() {

    if (

        walletConnectView

    ) {

        walletConnectView.style.display =

            "none";

    }

    if (

        walletInfoView

    ) {

        walletInfoView.style.display =

            "block";

    }

}

export function shortenAddress(
    address
) {

    if (

        !address

    ) {

        return "-";

    }

    return (

        address.slice(

            0,

            6

        )

        +

        "..."

        +

        address.slice(

            -4

        )

    );

}

export function setWalletDisconnected() {

    if (

        walletButton

    ) {

        walletButton.textContent =

            "Connect Wallet";

    }

    if (

        walletStatus

    ) {

        walletStatus.textContent =

            "Not Connected";

        walletStatus.className =

            "status offline";

    }

    if (

        walletAddress

    ) {

        walletAddress.textContent =

            "-";

    }

    showWalletConnect();

}

export function setWalletConnected(
    account
) {

    if (

        walletButton

    ) {

        walletButton.textContent =

            shortenAddress(

                account

            );

    }

    if (

        walletStatus

    ) {

        walletStatus.textContent =

            "Connected";

        walletStatus.className =

            "status online";

    }

    if (

        walletAddress

    ) {

        walletAddress.textContent =

            account;

    }

    showWalletInfo();

}

// =====================================================
// Loading
// =====================================================

export function disableButton(
    button,
    text = "Loading..."
) {

    if (

        !button

    ) {

        return;

    }

    button.disabled = true;

    button.dataset.originalText =

        button.textContent;

    button.textContent =

        text;

}

export function enableButton(
    button
) {

    if (

        !button

    ) {

        return;

    }

    button.disabled = false;

    if (

        button.dataset.originalText

    ) {

        button.textContent =

            button.dataset.originalText;

    }

}

export function showLoading(
    button,
    text = "Loading..."
) {

    disableButton(

        button,

        text

    );

}

export function hideLoading(
    button
) {

    enableButton(

        button

    );

}

// =====================================================
// UI
// =====================================================

export function initUI() {

    currentStep = 1;

    refreshWizard();

    updateProgress();

    setWalletDisconnected();

}

// =====================================================
// Toast
// =====================================================

export function showToast(

    message,

    type = "info"

) {

    console.log(

        `[${type.toUpperCase()}] ${message}`

    );

}

// =====================================================
// Helpers
// =====================================================

export function isFirstStep() {

    return currentStep === 1;

}

export function isLastStep() {

    return currentStep === TOTAL_STEPS;

}

export function resetUI() {

    initUI();

}

// =====================================================
// Export
// =====================================================

export default {

    initUI,

    showStep,

    nextStep,

    previousStep,

    getCurrentStep,

    getTotalSteps,

    refreshWizard,

    updateProgress,

    setWalletConnected,

    setWalletDisconnected,

    shortenAddress,

    disableButton,

    enableButton,

    showLoading,

    hideLoading,

    showToast,

    isFirstStep,

    isLastStep,

    resetUI

};

// =====================================================
// Theme Toggle
// =====================================================

const themeButton =
    document.getElementById("themeButton");

const savedTheme =
    localStorage.getItem("launchfuture.theme");

if (savedTheme === "light") {
    document.body.classList.add("lightMode");
    if (themeButton) themeButton.textContent = "☀️";
}

themeButton?.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("lightMode");
    themeButton.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem(
        "launchfuture.theme",
        isLight ? "light" : "dark"
    );
});

// =====================================================
// Wizard Step Click Navigation
// =====================================================

document.querySelectorAll(".wizardStep").forEach((item) => {
    item.addEventListener("click", () => {
        const step = Number(item.dataset.step);
        if (step) showStep(step);
    });
});

// =====================================================
// Prev/Next button integration
// =====================================================

document.getElementById("prevButton")?.addEventListener("click", () => {
    previousStep();
});

document.getElementById("nextButton")?.addEventListener("click", () => {
    nextStep();
});
