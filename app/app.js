// --- Game State ---
let questions = [];
let currentIdx = 0;
let currentMode = 'study'; // 'study' or 'test'
let streak = 0;
let lives = 1; // "One more try" buffer
let userRank = "Accounting Intern 🌱";

// --- DOM Elements ---
const cardElement = document.getElementById('card-element');
const quizSection = document.getElementById('quiz-section');
const flashcardSection = document.getElementById('flashcard-section');
const progressBar = document.getElementById('progress-bar');
const streakCount = document.getElementById('streak-count');
const livesDisplay = document.getElementById('lives-display');
const rankTitle = document.getElementById('rank-title');
const rankIcon = document.getElementById('rank-icon');

// --- Initialization ---
async function initApp() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questions = data.accounting_app_data.questions;
        renderCurrentQuestion();
    } catch (error) {
        console.error("Error loading ledger data:", error);
    }
}

// --- Mode Switching ---
document.getElementById('study-mode-btn').addEventListener('click', (e) => switchMode('study', e.target));
document.getElementById('test-mode-btn').addEventListener('click', (e) => switchMode('test', e.target));

function switchMode(mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (mode === 'study') {
        flashcardSection.classList.remove('hidden');
        quizSection.classList.add('hidden');
    } else {
        flashcardSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
    }
    renderCurrentQuestion();
}

// --- Rendering Logic ---
function renderCurrentQuestion() {
    const q = questions[currentIdx];
    const progressPercent = ((currentIdx + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Render Key Terms
    const termsList = document.getElementById('key-terms-list');
    termsList.innerHTML = q.key_terms.map(term => `<span class="term-chip">${term}</span>`).join('');

    if (currentMode === 'study') {
        document.getElementById('card-category').innerText = q.category;
        document.getElementById('card-question-text').innerText = q.prompt;
        document.getElementById('card-answer-text').innerText = q.correct_answer;
        document.getElementById('card-insight').innerText = q.professional_insight;
        cardElement.classList.remove('is-flipped');
    } else {
        document.getElementById('quiz-category').innerText = q.category;
        document.getElementById('quiz-question-text').innerText = q.prompt;
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => handleQuizAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    }
}

// --- Gamification & Logic ---
function handleQuizAnswer(selected, btn) {
    const q = questions[currentIdx];
    const feedback = document.getElementById('feedback-message');
    feedback.classList.remove('hidden');

    if (selected === q.correct_answer) {
        btn.classList.add('correct');
        streak++;
        lives = 1; // Reset life on success
        feedback.innerText = "Correct! The books are in balance! ✅";
        updateGamification();
        
        // Success celebration
        if (streak % 5 === 0) triggerConfetti();
        
        setTimeout(nextQuestion, 1500);
    } else {
        btn.classList.add('incorrect');
        if (lives > 0) {
            lives--;
            feedback.innerText = `⚠️ Careful! ${q.incorrect_explanations[selected]}`;
            livesDisplay.innerText = "❤️ (Last Audit Credit!)";
        } else {
            feedback.innerText = `Audit Failed! Streak reset. 📉 Correct: ${q.correct_answer}`;
            streak = 0;
            lives = 1;
            updateGamification();
            setTimeout(nextQuestion, 2500);
        }
    }
}

function updateGamification() {
    streakCount.innerText = streak;
    document.getElementById('streak-fire').classList.toggle('active', streak >= 3);
    livesDisplay.innerText = lives > 0 ? "❤️❤️" : "❤️💔";

    if (streak > 15) { userRank = "Senior Associate 💼"; rankIcon.innerText = "💼"; }
    else if (streak > 5) { userRank = "Staff Accountant 📎"; rankIcon.innerText = "📎"; }
    else { userRank = "Accounting Intern 🌱"; rankIcon.innerText = "🌱"; }
    
    rankTitle.innerText = userRank;
}

function nextQuestion() {
    currentIdx = (currentIdx + 1) % questions.length;
    document.getElementById('feedback-message').classList.add('hidden');
    renderCurrentQuestion();
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1e3a8a', '#fbbf24', '#10b981']
    });
}

// --- Flashcard Interaction ---
cardElement.addEventListener('click', () => {
    cardElement.classList.toggle('is-flipped');
});

document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('prev-btn').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + questions.length) % questions.length;
    renderCurrentQuestion();
});

// Launch!
initApp();
