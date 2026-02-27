const questionEl = document.getElementById('question');
const inputEl = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const correctScoreEl = document.getElementById('correct-score');
const wrongScoreEl = document.getElementById('wrong-score');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackText = document.getElementById('feedback-text');
const historyList = document.getElementById('history-list');
const emptyHistoryText = document.getElementById('empty-history');

const modeButtons = {
    multiplication: document.getElementById('mode-multiplication'),
    division: document.getElementById('mode-division'),
    order: document.getElementById('mode-order'),
    fractions: document.getElementById('mode-fractions')
};

let currentAnswer = 0;
let currentQuestionText = '';
let scores = { correct: 0, wrong: 0 };
let mode = 'multiplication'; // default mode

function setActiveModeButton() {
    Object.values(modeButtons).forEach(btn => btn.classList.remove('active'));
    const btn = modeButtons[mode];
    if (btn) btn.classList.add('active');
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a simple 5th-grade order of operations expression as a string and numeric answer.
// Use only small integers and ensure integer results for divisions.
function generateOrderExpression() {
    const templates = [
        // a + b × c
        () => {
            const a = randInt(1, 20);
            const b = randInt(2, 10);
            const c = randInt(2, 10);
            const expr = `${a} + ${b} * ${c}`;
            return { expr, answer: a + b * c };
        },
        // (a + b) × c
        () => {
            const a = randInt(1, 10);
            const b = randInt(1, 10);
            const c = randInt(2, 8);
            const expr = `(${a} + ${b}) * ${c}`;
            return { expr, answer: (a + b) * c };
        },
        // a × b + c
        () => {
            const a = randInt(2, 12);
            const b = randInt(2, 8);
            const c = randInt(0, 20);
            const expr = `${a} * ${b} + ${c}`;
            return { expr, answer: a * b + c };
        },
        // (a - b) + c × d
        () => {
            let a = randInt(5, 20);
            let b = randInt(1, 4);
            const c = randInt(2, 8);
            const d = randInt(1, 6);
            const expr = `(${a} - ${b}) + ${c} * ${d}`;
            return { expr, answer: (a - b) + c * d };
        },
        // a ÷ b + c (ensure integer division)
        () => {
            const b = randInt(2, 8);
            const q = randInt(1, 8);
            const a = b * q;
            const c = randInt(0, 15);
            const expr = `${a} / ${b} + ${c}`;
            return { expr, answer: q + c };
        }
    ];

    // pick a template and return
    return templates[randInt(0, templates.length - 1)]();
}

// Generate fraction problems suitable for 5th graders
function generateFractionExpression() {
    // Helper function to get GCD for simplifying fractions
    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    // Return simplified fraction
    function simplify(numerator, denominator) {
        if (numerator === 0) return { num: 0, den: 1 };
        const g = gcd(Math.abs(numerator), denominator);
        return { num: numerator / g, den: denominator / g };
    }

    // Template array with different difficulty levels
    const templates = [
        // Same denominator addition
        () => {
            let denom, n1, n2;
            do {
                denom = [2, 3, 4, 5, 6, 8][randInt(0, 5)];
                n1 = randInt(1, denom - 1);
                n2 = randInt(1, denom - 1);
            } while (n1 + n2 >= denom); // Loop instead of recursion
            
            const expr = `${n1}/${denom} + ${n2}/${denom}`;
            const answer = simplify(n1 + n2, denom);
            return { expr, answer };
        },
        // Same denominator subtraction
        () => {
            const denom = [2, 3, 4, 5, 6, 8][randInt(0, 5)];
            const n1 = randInt(2, denom - 1);
            const n2 = randInt(1, n1 - 1);
            const expr = `${n1}/${denom} - ${n2}/${denom}`;
            const answer = simplify(n1 - n2, denom);
            return { expr, answer };
        },
        // Different denominators with halves (2 and 4)
        () => {
            const denoms = [2, 4];
            const n1 = randInt(1, denoms[0] - 1);
            const n2 = randInt(1, denoms[1] - 1);
            const expr = `${n1}/${denoms[0]} + ${n2}/${denoms[1]}`;
            // Convert to common denominator 4: 1/2 = 2/4
            const num1Converted = n1 * 2;
            const answer = simplify(num1Converted + n2, denoms[1]);
            return { expr, answer };
        },
        // Different denominators with thirds and sixths
        () => {
            const denoms = [3, 6];
            const n1 = randInt(1, denoms[0] - 1);
            const n2 = randInt(1, denoms[1] - 1);
            const expr = `${n1}/${denoms[0]} + ${n2}/${denoms[1]}`;
            // Convert to common denominator 6: 1/3 = 2/6
            const num1Converted = n1 * 2;
            const answer = simplify(num1Converted + n2, denoms[1]);
            return { expr, answer };
        },
        // Subtraction with different denominators (halves and fourths)
        () => {
            let n1, n2, n2Converted;
            const denoms = [4, 2];
            do {
                n1 = randInt(2, denoms[0] - 1);
                n2 = randInt(1, denoms[1] - 1);
                n2Converted = n2 * 2;
            } while (n1 < n2Converted); // Loop instead of recursion
            
            const expr = `${n1}/${denoms[0]} - ${n2}/${denoms[1]}`;
            const answer = simplify(n1 - n2Converted, denoms[0]);
            return { expr, answer };
        }
    ];

    // Pick a random template
    return templates[randInt(0, templates.length - 1)]();
}

function generateQuestion() {
    inputEl.value = '';
    inputEl.focus();

    if (mode === 'multiplication') {
        const n1 = randInt(2, 12);
        const n2 = randInt(2, 12);
        currentAnswer = n1 * n2;
        currentQuestionText = `${n1} × ${n2}`;
        questionEl.classList.remove('bounce-in');
        void questionEl.offsetWidth;
        questionEl.innerHTML = `${n1} <span class="text-indigo-400">&times;</span> ${n2}`;
        questionEl.classList.add('bounce-in');
    } else if (mode === 'division') {
        const divisor = randInt(2, 12);
        const quotient = randInt(2, 12);
        const dividend = divisor * quotient;
        currentAnswer = quotient;
        currentQuestionText = `${dividend} ÷ ${divisor}`;
        questionEl.classList.remove('bounce-in');
        void questionEl.offsetWidth;
        questionEl.innerHTML = `${dividend} <span class="text-indigo-400">&divide;</span> ${divisor}`;
        questionEl.classList.add('bounce-in');
    } else if (mode === 'order') {
        // generate until reasonably sized answer
        let res;
        do {
            res = generateOrderExpression();
        } while (!Number.isFinite(res.answer) || Math.abs(res.answer) > 500);
        currentAnswer = res.answer;
        currentQuestionText = res.expr.replace(/\*/g, '×').replace(/\//g, '÷');
        questionEl.classList.remove('bounce-in');
        void questionEl.offsetWidth;
        // Display string with × and ÷
        questionEl.innerHTML = currentQuestionText;
        questionEl.classList.add('bounce-in');
    } else if (mode === 'fractions') {
        const res = generateFractionExpression();
        currentAnswer = res.answer; // { num: numerator, den: denominator }
        currentQuestionText = res.expr;
        questionEl.classList.remove('bounce-in');
        void questionEl.offsetWidth;
        questionEl.innerHTML = currentQuestionText;
        questionEl.classList.add('bounce-in');
    }
}

function addToHistory(questionText, userAnswer, expected, isCorrect) {
    if (emptyHistoryText) emptyHistoryText.remove();

    const item = document.createElement('div');
    item.className = `flex justify-between items-center p-4 rounded-2xl border-b-4 bounce-in ${
        isCorrect ? 'bg-green-900/40 border-green-600 text-green-200' : 'bg-red-900/40 border-red-600 text-red-200'
    }`;

    const icon = isCorrect ? '✅' : '❌';
    const expectedText = isCorrect ? '' : ` (Should be ${expected})`;

    item.innerHTML = `
        <span class="text-xl">${questionText} = ${userAnswer}</span>
        <span class="font-bold text-2xl">${icon}${expectedText}</span>
    `;

    historyList.prepend(item);
}

function showFeedback(isCorrect) {
    feedbackOverlay.classList.remove('hidden');
    if (isCorrect) {
        feedbackText.innerText = "YES!";
        feedbackText.className = "text-9xl font-black text-green-400 drop-shadow-2xl bounce-in";
    } else {
        feedbackText.innerText = "OOPS!";
        feedbackText.className = "text-9xl font-black text-red-500 drop-shadow-2xl shake";
    }

    setTimeout(() => {
        feedbackOverlay.classList.add('hidden');
        generateQuestion();
    }, 800);
}

function checkAnswer() {
    const val = inputEl.value.trim();
    if (val === "") return;

    let userAnswer;
    let isCorrect = false;

    if (mode === 'fractions') {
        // Parse fraction input (format: "3/4" or "3 / 4")
        const fractionMatch = val.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
        if (!fractionMatch) {
            inputEl.classList.add('shake');
            setTimeout(() => inputEl.classList.remove('shake'), 500);
            inputEl.value = '';
            return; // Invalid format, shake and clear
        }

        const userNum = parseInt(fractionMatch[1], 10);
        const userDen = parseInt(fractionMatch[2], 10);
        
        if (userDen === 0) {
            inputEl.classList.add('shake');
            setTimeout(() => inputEl.classList.remove('shake'), 500);
            inputEl.value = '';
            return; // Division by zero
        }

        // Simplify user's fraction for comparison
        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }
        const g = gcd(userNum, userDen);
        const simplifiedUserNum = userNum / g;
        const simplifiedUserDen = userDen / g;

        isCorrect = simplifiedUserNum === currentAnswer.num && simplifiedUserDen === currentAnswer.den;
        userAnswer = `${userNum}/${userDen}`;

    } else {
        userAnswer = Number(val);
        isCorrect = userAnswer === currentAnswer;
    }

    const expectedText = mode === 'fractions' 
        ? `${currentAnswer.num}/${currentAnswer.den}`
        : currentAnswer;

    addToHistory(currentQuestionText, userAnswer, expectedText, isCorrect);

    if (isCorrect) {
        scores.correct++;
        correctScoreEl.innerText = scores.correct;
        showFeedback(true);
    } else {
        scores.wrong++;
        wrongScoreEl.innerText = scores.wrong;
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 500);
        showFeedback(false);
    }
}

// mode switching
function setMode(newMode) {
    mode = newMode;
    setActiveModeButton();
    generateQuestion(); // generate new question for the selected mode without resetting scores/history

    // --- Google Analytics Tracking ---
    // This sends an event named 'select_math_mode' with the specific mode as a parameter
    gtag('event', 'select_math_mode', {
        'math_mode': newMode
    });
}

// attach listeners
submitBtn.addEventListener('click', checkAnswer);

inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

document.body.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        inputEl.focus();
    }
});

// mode button listeners - simple click works for both touch and mouse
Object.entries(modeButtons).forEach(([modeKey, btn]) => {
    btn.addEventListener('click', () => {
        setMode(modeKey);
        inputEl.focus();
    });
});

// initialize UI
setActiveModeButton();
generateQuestion();
