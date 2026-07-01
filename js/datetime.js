window.LF = window.LF || {};
(function(LF, ethers) {
"use strict";
// =====================================================
// LaunchFuture
// DateTime Manager
// =====================================================

// =====================================================
// State
// =====================================================

let timer = null;

// =====================================================
// Elements
// =====================================================

const clockElement =

    document.getElementById(
        "clockTime"
    );

// =====================================================
// Options
// =====================================================

const DATE_OPTIONS = Object.freeze({

    day:
        "2-digit",

    month:
        "short",

    year:
        "numeric"

});

const TIME_OPTIONS = Object.freeze({

    hour:
        "2-digit",

    minute:
        "2-digit",

    hour12:
        false

});

// =====================================================
// Current
// =====================================================

function getNow() {

    return new Date();

}

function getCurrentDate() {

    return formatDate(

        getNow()

    );

}

function getCurrentTime() {

    return formatTime(

        getNow()

    );

}

function getCurrentDateTime() {

    return (

        getCurrentDate()

        +

        " "

        +

        getCurrentTime()

    );

}

// =====================================================
// Time Zone
// =====================================================

function getTimeZone() {

    return Intl.DateTimeFormat()

        .resolvedOptions()

        .timeZone;

}

// =====================================================
// Format
// =====================================================

function formatDate(
    date
) {

    return date.toLocaleDateString(

        undefined,

        DATE_OPTIONS

    );

}

function formatTime(
    date
) {

    return date.toLocaleTimeString(

        undefined,

        TIME_OPTIONS

    );

}

function formatDateTime(
    date
) {

    return (

        formatDate(date)

        +

        " "

        +

        formatTime(date)

    );

}

// =====================================================
// Clock
// =====================================================

function updateClock() {

    if (!clockElement) {

        return;

    }

    const now = getNow();

    clockElement.textContent = formatTime(now);

}

// =====================================================
// Timer
// =====================================================

function startClock() {

    stopClock();

    updateClock();

    timer = setInterval(

        updateClock,

        1000

    );

}

function stopClock() {

    if (!timer) {

        return;

    }

    clearInterval(

        timer

    );

    timer = null;

}

// =====================================================
// Initialize
// =====================================================

function initDateTime() {

    startClock();

}

LF.datetime = {
    getNow, getCurrentDate, getCurrentTime, getCurrentDateTime, getTimeZone,
    formatDate, formatTime, formatDateTime,
    updateClock, startClock, stopClock, initDateTime
};

})(window.LF, window.ethers);
