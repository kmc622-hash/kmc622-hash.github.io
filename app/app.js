let questions = [];
let currentIdx = 0;
let currentMode = 'study'; 
let streak = 0;
let lives = 1; 
let userRank = "Accounting Intern 🌱";

const cardElement = document.getElementById('card-element');
const quizSection = document.getElementById('quiz-section');
const flashcardSection = document.getElementById('flashcard-section');
const progressBar = document.getElementById('progress-bar');
const streakCount = document.getElementById('streak-count');
const livesDisplay = document.getElementById('lives-display');
const rankTitle = document.getElementById('rank-title');
const rankIcon = document.getElementById('rank-icon');

async function initApp() {
    try {
        const response = await fetch('./questions.json');
        if (!response.ok) throw new Error("Could not find questions.json");
        const data = await response.json();
        questions = data.accounting_app_data.questions;
        renderCurrentQuestion();
    } catch (error) {
        console.error("Critical Error:", error);
        document.getElementById('card-question-text').innerText = "Data load failed. Check console.";
    }
}

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

function renderCurrentQuestion() {
    if (questions.length === 0) return;
    const q = questions[currentIdx];
    
    progressBar.style.width = `${((currentIdx + 1) / questions.length) * 100}%`;
    document.getElementById('key-terms-list').innerHTML = q.key_terms.map(term => `<span class="term-chip">${term}</span>`).join('');

    if (currentMode === 'study') {
        document.getElementById('card-category').innerText = q.category;
        document.getElementById('card-question-text').innerText = q.prompt;
        document.getElementById('card-answer-text').innerText = q.correct_answer;
        document.getElementById('card-insight').innerText = q.professional_insight;
        cardElement.classList.remove('is-flipped');
    } else {
        document.getElementById('quiz-category').innerText = q.category;
        document.getElementById('quiz-question-text').innerText = q.prompt;
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => handleQuizAnswer(opt, btn);
            container.appendChild(btn);
        });
    }
}

function handleQuizAnswer(selected, btn) {
    const q = questions[currentIdx];
    const feedback = document.getElementById('feedback-message');
    feedback.classList.remove('hidden');

    if (selected === q.correct_answer) {
        btn.classList.add('correct');
        streak++;
        lives = 1;
        feedback.innerText = "Correct! The books are in balance! ✅";
        feedback.style.background = "#dcfce7";
        feedback.style.color = "#166534";
        updateGamification();
        if (streak % 5 === 0) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(nextQuestion, 1500);
    } else {
        btn.classList.add('incorrect');
        if (lives > 0) {
            lives--;
            feedback.innerText = `⚠️ ${q.incorrect_explanations[selected]}`;
            feedback.style.background = "#fef2f2";
            feedback.style.color = "#991b1b";
            livesDisplay.innerText = "❤️ (Last Credit!)";
        } else {
            feedback.innerText = `Audit Failed! Answer: ${q.correct_answer}`;
            streak = 0; lives = 1;
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

document.getElementById('study-mode-btn').addEventListener('click', (e) => switchMode('study', e.target));
document.getElementById('test-mode-btn').addEventListener('click', (e) => switchMode('test', e.target));
cardElement.addEventListener('click', () => cardElement.classList.toggle('is-flipped'));
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('prev-btn').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + questions.length) % questions.length;
    renderCurrentQuestion();
});

window.onload = initApp;
