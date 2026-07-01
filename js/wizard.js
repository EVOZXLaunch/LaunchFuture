window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// LaunchFuture
// Wizard Engine
// Part 1
// =====================================================

// =====================================================
// Constants
// =====================================================

const TOTAL_STEPS =
    
    6;

const STORAGE_KEY =

    "launchfuture.wizard";

// =====================================================
// State
// =====================================================

let currentStep =

    1;
// =====================================================
// Wizard Data
// =====================================================

const wizardData = {

    token: {},

    features: {},

    metadata: {},

    payment: {}

};

// =====================================================
// Persistence
// =====================================================

function saveWizard() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(

            wizardData

        )

    );

}

function loadWizard() {

    const saved =

        localStorage.getItem(

            STORAGE_KEY

        );

    if (

        !saved

    ) {

        return false;

    }

    try {

        const data =

            JSON.parse(

                saved

            );

        wizardData.token =

            data.token ?? {};

        wizardData.features =

            data.features ?? {};

        wizardData.metadata =

            data.metadata ?? {};

        wizardData.payment =

            data.payment ?? {};

      return true;

    }

    catch (

        error

    ) {

        console.error(

            error

        );

      return false;

    }

}

function resetWizard() {

    currentStep = 1;

    wizardData.token = {};

    wizardData.features = {};

    wizardData.metadata = {};

    wizardData.payment = {};

    localStorage.removeItem(

        STORAGE_KEY

    );

}

// =====================================================
// Getters
// =====================================================

function getCurrentStep() {

    return currentStep;

}

function getTotalSteps() {

    return TOTAL_STEPS;

}

function getWizardData() {

    return structuredClone(

        wizardData

    );

}

// =====================================================
// Navigation
// =====================================================

function nextStep() {

    if (

        currentStep <

        TOTAL_STEPS

    ) {

        currentStep++;

    }

    return currentStep;

}

function previousStep() {

    if (

        currentStep >

        1

    ) {

        currentStep--;

    }

    return currentStep;

}

function goToStep(
    step
) {

    if (

        step < 1 ||

        step >

        TOTAL_STEPS

    ) {

        throw new Error(

            "Invalid wizard step."

        );

    }

    currentStep =

        step;

    return currentStep;

}

// =====================================================
// Progress
// =====================================================

function getProgress() {

    return Math.round(

        (

            currentStep /

            TOTAL_STEPS

        ) * 100

    );

}

function isFirstStep() {

    return (

        currentStep ===

        1

    );

}

function isLastStep() {

    return (

        currentStep ===

        TOTAL_STEPS

    );

}

// =====================================================
// Data
// =====================================================

function setTokenData(
    data
) {

    wizardData.token = {

        ...wizardData.token,

        ...data

    };

    saveWizard();

}

function setFeatureData(
    data
) {

    wizardData.features = {

        ...wizardData.features,

        ...data

    };

  saveWizard();

}

function setMetadataData(
    data
) {

    wizardData.metadata = {

        ...wizardData.metadata,

        ...data

    };

  saveWizard();

}

function setPaymentData(
    data
) {

    wizardData.payment = {

        ...wizardData.payment,

        ...data

    };

  saveWizard();

}

// =====================================================
// Helpers
// =====================================================

function hasWizardData() {

    return (

        Object.keys(

            wizardData.token

        ).length > 0 ||

        Object.keys(

            wizardData.features

        ).length > 0 ||

        Object.keys(

            wizardData.metadata

        ).length > 0 ||

        Object.keys(

            wizardData.payment

        ).length > 0

    );

}

function isWizardEmpty() {

    return !

        hasWizardData();

}

LF.wizard = {
    TOTAL_STEPS, saveWizard, loadWizard, resetWizard,
    getCurrentStep, getTotalSteps, getWizardData,
    nextStep, previousStep, goToStep, getProgress,
    isFirstStep, isLastStep,
    setTokenData, setFeatureData, setMetadataData, setPaymentData,
    hasWizardData, isWizardEmpty
};

})(window.LF, window.ethers);
