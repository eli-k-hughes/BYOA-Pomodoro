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
const themeToggle = document.getElementById('theme-toggle');

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
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? 25 * 60 : 5 * 60;
    isPlaying = false;  // Ensure timer is paused when switching modes
    clearInterval(timerId);
    timerId = null;
    updateDisplay();
    updateButtonState();
}

function updateButtonState() {
    comboButton.className = isWorkTime ? 'work' : 'rest';
    const symbolSpan = comboButton.querySelector('.button-symbol');
    const textSpan = comboButton.querySelector('.button-text');
    
    symbolSpan.textContent = isPlaying ? '⏸' : '▶';
    
    // Update the emoji based on mode (now using fire for work)
    textSpan.textContent = isWorkTime ? '🔥' : '☕️';
    
    // Update opacity based on play state
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

// Add the theme toggle handler
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Check saved preference
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
} 