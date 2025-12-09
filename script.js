/**
 * APP STATE & CONFIG
 */
const CONFIG = {
    COIN_TO_PKR: 50000,
    MIN_WITHDRAW: 500,
    MINING_RATE_PER_HR: 50,
    ADS_INTERVAL: 4 * 60 * 60 * 1000, // 4 hours
    SPIN_LIMIT: 4
};

// Language Dictionary
const STRINGS = {
    en: {
        login_title: "Login / Register",
        balance: "Total Balance",
        coins: "Total Coins",
        daily_reward: "Daily Reward",
        games_tasks: "Games & Tasks",
        plinko: "Plinko",
        spin: "Spin Wheel",
        quiz: "Quiz",
        mining: "Mining",
        withdraw: "Withdraw",
        scratch: "Scratch",
        refer_earn: "Refer & Earn"
    },
    ur: {
        login_title: "لاگ ان / رجسٹر",
        balance: "کل بیلنس",
        coins: "کل سکے",
        daily_reward: "روزانہ انعام",
        games_tasks: "گیمز اور ٹاسکس",
        plinko: "پلنکو",
        spin: "گھمائیں اور جیتیں",
        quiz: "کوئز",
        mining: "مائننگ",
        withdraw: "نکلوائیں",
        scratch: "سکریچ کارڈ",
        refer_earn: "ریفر کریں اور کمائیں"
    }
};

let currentUser = null;
let currentLang = 'ur'; // Default Urdu

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    updateUI();
});

// --- NAVIGATION & UI ---
function navigate(viewId) {
    // Show Ad logic (Simulated: 30% chance or mandatory)
    if(viewId !== 'dashboard' && viewId !== 'auth-view' && Math.random() > 0.7) {
        showAd(() => switchView(viewId));
    } else {
        switchView(viewId);
    }
}

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    const target = document.getElementById(viewId + '-view') || document.getElementById('dashboard-view');
    target.classList.remove('d-none');
    
    // Header logic
    if (viewId === 'auth') {
        document.getElementById('user-balance-display').classList.add('d-none');
        document.getElementById('logout-btn').classList.add('d-none');
    } else if (currentUser) {
        document.getElementById('user-balance-display').classList.remove('d-none');
        document.getElementById('logout-btn').classList.remove('d-none');
        updateBalanceDisplay();
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ur' ? 'en' : 'ur';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
    document.getElementById('lang-btn-text').innerText = currentLang === 'ur' ? 'English' : 'اردو';
    
    // Translate Elements
    document.querySelectorAll('[data-trn]').forEach(el => {
        const key = el.getAttribute('data-trn');
        if(STRINGS[currentLang][key]) el.innerText = STRINGS[currentLang][key];
    });
}

function showAlert(msg, type = 'success') {
    const box = document.getElementById('alert-box');
    box.className = `alert alert-${type}`;
    box.innerText = msg;
    box.classList.remove('d-none');
    setTimeout(() => box.classList.add('d-none'), 3000);
}

// --- AUTHENTICATION (Simulated Database) ---
function getUsersDB() {
    return JSON.parse(localStorage.getItem('pakreward_users')) || [];
}

function saveUser(user) {
    const users = getUsersDB();
    const index = users.findIndex(u => u.email === user.email);
    if(index > -1) users[index] = user;
    else users.push(user);
    
    localStorage.setItem('pakreward_users', JSON.stringify(users));
    localStorage.setItem('pakreward_session', user.email);
    currentUser = user;
    updateBalanceDisplay();
}

function checkSession() {
    const email = localStorage.getItem('pakreward_session');
    if(email) {
        const users = getUsersDB();
        currentUser = users.find(u => u.email === email);
        if(currentUser) navigate('dashboard');
        else navigate('auth');
    } else {
        navigate('auth');
    }
}

function switchAuthTab(tab) {
    document.querySelector('.nav-link.active').classList.remove('active');
    event.target.classList.add('active');
    
    if(tab === 'login') {
        document.getElementById('login-form').classList.remove('d-none');
        document.getElementById('register-form').classList.add('d-none');
    } else {
        document.getElementById('login-form').classList.add('d-none');
        document.getElementById('register-form').classList.remove('d-none');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    
    const users = getUsersDB();
    if(users.find(u => u.email === email)) return showAlert('Email already exists', 'danger');
    
    // Create Temp User (Simulate Verify)
    const code = Math.floor(1000 + Math.random() * 9000);
    console.log("VERIFICATION CODE:", code); // SIMULATION
    alert("Verification Code sent to Console: " + code);
    
    sessionStorage.setItem('temp_reg', JSON.stringify({
        email, pass, code, 
        coins: 100, // Sign up bonus
        spins: 4, 
        miningStart: null,
        refCode: 'PK' + Math.floor(Math.random()*10000)
    }));
    
    document.getElementById('register-form').classList.add('d-none');
    document.getElementById('verify-form').classList.remove('d-none');
}

function handleVerify() {
    const input = document.getElementById('verify-code-input').value;
    const temp = JSON.parse(sessionStorage.getItem('temp_reg'));
    
    if(parseInt(input) === temp.code) {
        saveUser(temp);
        sessionStorage.removeItem('temp_reg');
        showAlert('Verified! Logging in...');
        navigate('dashboard');
    } else {
        showAlert('Invalid Code', 'danger');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const users = getUsersDB();
    const user = users.find(u => u.email === email && u.pass === pass);
    
    if(user) {
        localStorage.setItem('pakreward_session', user.email);
        currentUser = user;
        navigate('dashboard');
    } else {
        showAlert('Invalid Credentials', 'danger');
    }
}

function logout() {
    localStorage.removeItem('pakreward_session');
    currentUser = null;
    location.reload();
}

// --- WALLET & REWARDS ---
function updateBalanceDisplay() {
    if(!currentUser) return;
    document.getElementById('nav-coins').innerText = currentUser.coins;
    document.getElementById('dash-coins').innerText = currentUser.coins;
    document.getElementById('wallet-coins').innerText = currentUser.coins;
    
    const pkr = (currentUser.coins / CONFIG.COIN_TO_PKR).toFixed(2);
    document.getElementById('dash-pkr').innerText = pkr;
    document.getElementById('wallet-pkr').innerText = pkr;
    
    document.getElementById('my-ref-code').innerText = currentUser.refCode;
}

function claimDailyReward() {
    const today = new Date().toDateString();
    if(currentUser.lastDaily === today) return showAlert('Already claimed today!', 'warning');
    
    showAd(() => {
        currentUser.coins += 150;
        currentUser.lastDaily = today;
        saveUser(currentUser);
        showAlert('+150 Coins Claimed!');
    });
}

function handleWithdraw(e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const pkrBal = currentUser.coins / CONFIG.COIN_TO_PKR;
    
    if(amount < CONFIG.MIN_WITHDRAW) return showAlert(`Min Withdraw is ${CONFIG.MIN_WITHDRAW} PKR`, 'danger');
    if(pkrBal < amount) return showAlert('Insufficient Balance', 'danger');
    
    showAd(() => {
        currentUser.coins -= (amount * CONFIG.COIN_TO_PKR);
        saveUser(currentUser);
        showAlert('Withdraw request submitted! Check email.', 'success');
        navigate('dashboard');
    });
}

// --- ADS SIMULATION ---
function showAd(callback) {
    const modal = document.getElementById('ad-modal');
    const timerSpan = document.getElementById('ad-timer');
    const btn = document.getElementById('close-ad-btn');
    let timeLeft = 5;
    
    modal.classList.remove('d-none');
    btn.disabled = true;
    timerSpan.innerText = timeLeft;
    
    const interval = setInterval(() => {
        timeLeft--;
        timerSpan.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(interval);
            btn.disabled = false;
            btn.innerText = "Close Ad";
            btn.onclick = () => {
                modal.classList.add('d-none');
                if(callback) callback();
            };
        }
    }, 1000);
}

// --- GAMES LOGIC ---

// 1. PLINKO (Simplified Canvas Visuals)
function playPlinko() {
    if(currentUser.coins < 100) return showAlert('Need 100 coins', 'danger');
    currentUser.coins -= 100;
    saveUser(currentUser);
    
    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    let x = canvas.width / 2;
    let y = 0;
    
    // Simple Animation
    const anim = setInterval(() => {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0,0, canvas.width, canvas.height); // Trail effect
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI*2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        
        y += 5;
        x += (Math.random() - 0.5) * 20; // Random bounce
        
        // Bounds
        if(x < 20) x = 20;
        if(x > canvas.width - 20) x = canvas.width - 20;

        if(y > canvas.height) {
            clearInterval(anim);
            // Result Logic
            let win = 0;
            if(x > 100 && x < 220) win = 50; // Center (Loss)
            else win = 300; // Sides (Win)
            
            currentUser.coins += win;
            saveUser(currentUser);
            showAlert(`Plinko Finished! Won ${win} coins`);
        }
    }, 16);
}

// 2. SPIN WHEEL
function spinWheel() {
    if(currentUser.spins <= 0) return showAlert('No spins left today. Watch Ad?', 'warning'); // Simplified
    
    const wheel = document.getElementById('wheel');
    const deg = Math.floor(2000 + Math.random() * 2000); // Random rotation
    
    wheel.style.transition = 'transform 4s ease-out';
    wheel.style.transform = `rotate(${deg}deg)`;
    
    currentUser.spins--;
    document.getElementById('spin-btn').disabled = true;
    
    setTimeout(() => {
        // Calculate Win (Mock)
        const win = [50, 100, 200, 500][Math.floor(Math.random()*4)];
        showAd(() => {
            currentUser.coins += win;
            saveUser(currentUser);
            showAlert(`You won ${win} Coins!`);
            wheel.style.transition = 'none';
            wheel.style.transform = `rotate(0deg)`;
            document.getElementById('spin-btn').disabled = false;
            document.getElementById('spin-left').innerText = currentUser.spins;
        });
    }, 4500);
}

// 3. MINING
let miningInterval;
function toggleMining() {
    const btn = document.getElementById('mining-btn');
    const icon = document.getElementById('mining-icon');
    
    if(!currentUser.miningStart) {
        // Start Mining
        showAd(() => {
            currentUser.miningStart = new Date().getTime();
            saveUser(currentUser);
            updateMiningUI();
        });
    } else {
        // Claim Mining
        const now = new Date().getTime();
        const diffHrs = (now - currentUser.miningStart) / (1000 * 60 * 60);
        
        if(diffHrs < 0.1) return showAlert('Mining just started... wait a bit', 'warning');
        
        const earned = Math.floor(diffHrs * CONFIG.MINING_RATE_PER_HR);
        currentUser.coins += earned;
        currentUser.miningStart = null;
        saveUser(currentUser);
        
        clearInterval(miningInterval);
        icon.classList.remove('mining-active');
        btn.innerText = "Start Mining";
        showAlert(`Mined ${earned} coins!`);
    }
}

function updateMiningUI() {
    if(!currentUser || !currentUser.miningStart) return;
    
    const icon = document.getElementById('mining-icon');
    const btn = document.getElementById('mining-btn');
    const timer = document.getElementById('mining-timer');
    
    icon.classList.add('mining-active');
    btn.innerText = "Claim Coins";
    
    miningInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - currentUser.miningStart;
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        timer.innerText = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

// 4. QUIZ (Mock)
const questions = [
    { q: "Capital of Pakistan?", a: ["Lahore", "Islamabad", "Karachi"], c: 1 },
    { q: "Currency of USA?", a: ["Euro", "Yen", "Dollar"], c: 2 },
    { q: "2 + 2 = ?", a: ["3", "4", "5"], c: 1 }
];
let currentQ = 0;

function loadQuiz() {
    const q = questions[currentQ];
    document.getElementById('quiz-question').innerText = q.q;
    const div = document.getElementById('quiz-options');
    div.innerHTML = '';
    
    q.a.forEach((opt, index) => {
        div.innerHTML += `<button class="btn btn-outline-primary py-3" onclick="answerQuiz(${index})">${opt}</button>`;
    });
}

function answerQuiz(index) {
    if(index === questions[currentQ].c) {
        showAlert('Correct! +50 Coins');
        currentUser.coins += 50;
    } else {
        showAlert('Wrong! -10 Coins', 'danger');
        currentUser.coins -= 10;
    }
    saveUser(currentUser);
    currentQ = (currentQ + 1) % questions.length;
    showAd(() => loadQuiz());
}

// Initial Calls for Game states
document.getElementById('quiz-view').addEventListener('DOMNodeInserted', () => {
    if(document.getElementById('quiz-view').classList.contains('d-none') === false) loadQuiz();
});
if(currentUser && currentUser.miningStart) updateMiningUI();

// Util: Copy Ref
function copyRef() {
    navigator.clipboard.writeText(currentUser.refCode);
    showAlert('Referral Code Copied!');
}
