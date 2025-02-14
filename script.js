let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isWorkTime = true;
let isPlaying = false;
let workIntervalsCompleted = 0;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const comboButton = document.getElementById('combo-button');
const resetButton = document.getElementById('reset');
const tooltip = document.getElementById('tooltip');
const tooltipClose = document.querySelector('.tooltip-close');
const intervalCounter = document.getElementById('interval-counter');
const addTimeButton = document.getElementById('add-time');
const settingsToggle = document.getElementById('settings-toggle');
const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.querySelector('.settings-close');
const settingsDefault = document.getElementById('settings-default');
const settingsSave = document.getElementById('settings-save');
const workDurationInput = document.getElementById('work-duration');
const restDurationInput = document.getElementById('rest-duration');
const showAddTimeSwitch = document.getElementById('show-add-time');
const addTimeLabel = document.getElementById('add-time-label');

// Show tooltip on every page load
setTimeout(() => {
    tooltip.classList.add('show');
}, 500);

// Handle tooltip close button
tooltipClose.addEventListener('click', () => {
    tooltip.classList.remove('show');
});

function hideTooltip() {
    tooltip.classList.remove('show');
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // Update page title with current time and state
    const stateEmoji = isWorkTime ? '🔥' : '☕️';
    document.title = `${timeString} ${stateEmoji} 🍅 Pomodoro`;

    updateAddTimeButtonVisibility();
}

function switchMode() {
    isWorkTime = !isWorkTime;
    const workDuration = parseInt(localStorage.getItem('workDuration')) || 25;
    const restDuration = parseInt(localStorage.getItem('restDuration')) || 5;
    timeLeft = isWorkTime ? workDuration * 60 : restDuration * 60;
    isPlaying = false;
    clearInterval(timerId);
    timerId = null;
    updateDisplay();
    updateButtonState();
    addTimeButton.classList.remove('visible');
}

function updateButtonState() {
    comboButton.className = isWorkTime ? 'work' : 'rest';
    comboButton.classList.toggle('playing', isPlaying);
    const textSpan = comboButton.querySelector('.button-text');
    
    textSpan.textContent = isWorkTime ? '🔥' : '☕️';
    textSpan.style.opacity = isPlaying ? '1' : '0.8';
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }  // Start slightly above the counter
    });
}

function startTimer() {
    if (timerId === null) {
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                isPlaying = false;
                if (isWorkTime) {
                    // Only increment counter when work interval completes
                    workIntervalsCompleted++;
                    intervalCounter.textContent = workIntervalsCompleted;
                    triggerConfetti();  // Celebrate completion
                }
                switchMode();
                hideTooltip();
                alert(isWorkTime ? 'Break time is over! Time to work!' : 'Work time is over! Take a break!');
                startTimer();
            }
        }, 1000);
    }
}

// Handle clicks
comboButton.addEventListener('click', (e) => {
    if (e.detail === 2) {
        // Double click - switch modes
        clearInterval(timerId);
        timerId = null;
        isPlaying = false;
        switchMode();
    } else if (e.detail === 1) {
        // Single click - play/pause
        setTimeout(() => {
            if (e.detail === 1) {
                isPlaying = !isPlaying;
                if (isPlaying) {
                    startTimer();
                } else {
                    clearInterval(timerId);
                    timerId = null;
                }
                updateButtonState();
            }
        }, 200);
    }
});

resetButton.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPlaying = false;
    timeLeft = isWorkTime ? 25 * 60 : 5 * 60;
    workIntervalsCompleted = 0;  // Reset counter
    intervalCounter.textContent = '0';  // Update display
    updateDisplay();
    updateButtonState();
});

// Initialize button state
updateButtonState();

// Initialize display
updateDisplay();

// Move theme toggle setup to after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    console.log('Theme toggle element:', themeToggle); // Debug log
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        console.log('Theme toggle clicked'); // Debug log
        document.body.classList.toggle('dark-mode');
        console.log('Dark mode class:', document.body.classList.contains('dark-mode')); // Debug log
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        console.log('Theme saved:', localStorage.getItem('theme')); // Debug log
    });

    // Check saved preference on load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Saved theme:', savedTheme, 'Prefers dark:', prefersDark); // Debug log

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
});

function updateAddTimeButtonVisibility() {
    // Check if feature is enabled
    if (localStorage.getItem('showAddTime') === 'false') {
        addTimeButton.classList.remove('visible');
        return;
    }

    const halfTime = isWorkTime ? (25 * 60) / 2 : (5 * 60) / 2;
    
    if (!addTimeButton.classList.contains('visible')) {
        if (timeLeft <= halfTime && timeLeft > 0) {
            addTimeButton.classList.add('visible');
            addTimeButton.classList.toggle('work', isWorkTime);
            addTimeButton.classList.toggle('rest', !isWorkTime);
        }
    } else {
        if (timeLeft === 0) {
            addTimeButton.classList.remove('visible');
        }
    }
}

function handleAddTime() {
    const addTimeButton = document.getElementById('add-time');
    addTimeButton.classList.add('time-added');
    
    // Remove the class after animation completes
    setTimeout(() => {
        addTimeButton.classList.remove('time-added');
    }, 400);
    
    // Add the time (existing functionality)
    timeLeft += 5 * 60;
    updateDisplay();
}

// Update the event listener
document.getElementById('add-time').addEventListener('click', handleAddTime);

// Add these event listeners with other initialization code
settingsToggle.addEventListener('click', () => {
    settingsModal.classList.add('show');
    workDurationInput.value = localStorage.getItem('workDuration') || '25';
    restDurationInput.value = localStorage.getItem('restDuration') || '5';
    showAddTimeSwitch.checked = localStorage.getItem('showAddTime') !== 'false';
    addTimeLabel.textContent = showAddTimeSwitch.checked ? 
        'Show +5 mins button' : 
        'Hide +5 mins button';
});

settingsClose.addEventListener('click', () => {
    settingsModal.classList.remove('show');
});

settingsDefault.addEventListener('click', () => {
    workDurationInput.value = '25';
    restDurationInput.value = '5';
    showAddTimeSwitch.checked = true;
});

settingsSave.addEventListener('click', () => {
    const workDuration = Math.min(99, Math.max(1, parseInt(workDurationInput.value) || 25));
    const restDuration = Math.min(99, Math.max(1, parseInt(restDurationInput.value) || 5));
    
    localStorage.setItem('workDuration', workDuration.toString());
    localStorage.setItem('restDuration', restDuration.toString());
    localStorage.setItem('showAddTime', showAddTimeSwitch.checked);
    
    // Update current timer if needed
    if (isWorkTime) {
        timeLeft = workDuration * 60;
    } else {
        timeLeft = restDuration * 60;
    }
    
    updateDisplay();
    settingsModal.classList.remove('show');
});

// Update the label when switch changes
showAddTimeSwitch.addEventListener('change', () => {
    addTimeLabel.textContent = showAddTimeSwitch.checked ? 
        'Show +5 mins button' : 
        'Hide +5 mins button';
}); 