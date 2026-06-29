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
        "clock"
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

    second:
        "2-digit",

    hour12:
        false

});

// =====================================================
// Current
// =====================================================

export function getNow() {

    return new Date();

}

export function getCurrentDate() {

    return formatDate(

        getNow()

    );

}

export function getCurrentTime() {

    return formatTime(

        getNow()

    );

}

export function getCurrentDateTime() {

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

export function getTimeZone() {

    return Intl.DateTimeFormat()

        .resolvedOptions()

        .timeZone;

}

// =====================================================
// Format
// =====================================================

export function formatDate(
    date
) {

    return date.toLocaleDateString(

        undefined,

        DATE_OPTIONS

    );

}

export function formatTime(
    date
) {

    return date.toLocaleTimeString(

        undefined,

        TIME_OPTIONS

    );

}

export function formatDateTime(
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

export function updateClock() {

    if (!clockElement) {

        return;

    }

    const now = getNow();

    clockElement.innerHTML = `

        <span class="btnIcon">🕐</span>

        <span>

        <div class="clockTime">

            ${formatTime(now)}

        </div>

        <div class="clockDate">

            ${getUTCOffsetLabel(now)}

        </div>

        </span>

    `;

}

// =====================================================
// UTC Offset Label
// =====================================================

export function getUTCOffsetLabel(date = new Date()) {

    const minutes = -date.getTimezoneOffset();

    const sign = minutes >= 0 ? "+" : "-";

    const abs = Math.abs(minutes);

    const hours = Math.floor(abs / 60);

    const mins = abs % 60;

    return mins === 0
        ? `UTC${sign}${hours}`
        : `UTC${sign}${hours}:${String(mins).padStart(2, "0")}`;

}

// =====================================================
// Timer
// =====================================================

export function startClock() {

    stopClock();

    updateClock();

    timer = setInterval(

        updateClock,

        1000

    );

}

export function stopClock() {

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

export function initDateTime() {

    startClock();

}
