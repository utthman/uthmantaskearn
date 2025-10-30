// --- State Variables (Master lists and user data stored in localStorage) ---
let isLoggedIn = false;
let isAdmin = false;
        
// MASTER LIST: Stores all users (Crucial for high user count)
let allUsers = {}; 

// The current user's session data (Default structure)
let userData = {
    username: '',
    coins: 0,
    taskEarnings: 0,
    referralBonus: 0,
    totalReferrals: 0,
    level: 1,
    referralCode: 'UTHMAN123', // Default/placeholder
    lastClaimTime: 0,
    notifications: [],
    transactions: [],
    messages: [],
    achievements: [
        { id: 1, name: 'First Login', completed: true, reward: 100, description: 'Log in for the first time.' },
        { id: 2, name: '10 Tasks Done', completed: false, reward: 500, description: 'Complete 10 tasks.' },
        { id: 3, name: 'Refer 5 Friends', completed: false, reward: 1000, description: 'Get 5 active referrals.' }
    ],
    password: '', 
    countryCode: '',
    whatsappNumber: '',
    isBlocked: false,
};

// PLATFORM SETTINGS: Stores global admin-controlled data (All users load this)
let platformSettings = {
    withdrawalOpen: false,
    minWithdrawal: 100,
    dailyClaimAmount: 50,
    // --- NEW: Referral Settings ---
    referralSignupBonus: 100, // Coins for the new user
    referralGiverBonus: 150, // Coins for the referrer
    // -----------------------------
    news: [
        { id: 1, title: 'Withdrawal Maintenance', content: 'The withdrawal portal will be closed until next week for system updates.', type: 'alert' },
        { id: 2, title: 'New Social Media Tasks!', content: 'Earn 100 coins per follow on Instagram and TikTok!', type: 'success' }
    ],
    tasks: [
        { id: 1, name: 'Follow us on Twitter', category: 'social', reward: 50, status: 'available' },
        { id: 2, name: 'Complete 5-min Survey', category: 'survey', reward: 150, status: 'available' },
        { id: 3, name: 'Download App X', category: 'download', reward: 100, status: 'available' },
        { id: 4, name: 'Write a Review', category: 'review', reward: 80, status: 'available' }
    ],
    promoCodes: [
        { code: 'WELCOMENOW', reward: 50, uses: 0, maxUses: 100 }
    ]
};
        
// Admin state (simple check for demo)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';


// --- DOM Elements (Ensure all IDs match your HTML) ---
const authPage = document.getElementById('authPage');
const userDashboard = document.getElementById('userDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const telegramPopup = document.getElementById('telegramPopup');
const telegramFloat = document.getElementById('telegramFloat');
const closeTelegramPopup = document.getElementById('closeTelegramPopup');
const telegramBtn = document.getElementById('telegramBtn');
const joinTelegram = document.getElementById('joinTelegram');
        
const userWelcome = document.getElementById('userWelcome');
const userCoins = document.getElementById('userCoins');
const taskEarnings = document.getElementById('taskEarnings');
const referralBonus = document.getElementById('referralBonus');
const totalBalance = document.getElementById('totalBalance');
const dailyClaimAmount = document.getElementById('dailyClaimAmount');
const claimDailyBtn = document.getElementById('claimDailyBtn');
const claimStatus = document.getElementById('claimStatus');
const nextClaimTime = document.getElementById('nextClaimTime');
const myReferralCode = document.getElementById('myReferralCode');
const copyReferralBtn = document.getElementById('copyReferralBtn');
const totalReferrals = document.getElementById('totalReferrals');
const withdrawalClosed = document.getElementById('withdrawalClosed');
const withdrawalOpen = document.getElementById('withdrawalOpen');
const minWithdrawal = document.getElementById('minWithdrawal');
const notificationsList = document.getElementById('notificationsList');
const notificationsBtn = document.getElementById('notificationsBtn');
const notificationCount = document.getElementById('notificationCount');
const tasksList = document.getElementById('tasksList');
const taskFilter = document.getElementById('taskFilter');
const newsList = document.getElementById('newsList');
const achievementsList = document.getElementById('achievementsList');
const transactionHistory = document.getElementById('transactionHistory');
const logoutBtn = document.getElementById('logoutBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

const toggleWithdrawal = document.getElementById('toggleWithdrawal');
const minWithdrawalInput = document.getElementById('minWithdrawalInput');
const updateMinWithdrawal = document.getElementById('updateMinWithdrawal');
const totalSignups = document.getElementById('totalSignups');
const blockedUsers = document.getElementById('blockedUsers'); 
const pendingTasks = document.getElementById('pendingTasks');
const addTaskForm = document.getElementById('addTaskForm');
const adminTasksList = document.getElementById('adminTasksList');
const adminPromoCodeForm = document.getElementById('adminPromoCodeForm');


// --- Data Handling Functions ---

function saveState() {
    if (isLoggedIn && !isAdmin && userData.username) {
        allUsers[userData.username] = userData;
    }
    localStorage.setItem('platformSettings', JSON.stringify(platformSettings));
    localStorage.setItem('allUsers', JSON.stringify(allUsers)); 
    localStorage.setItem('userData', JSON.stringify(userData)); 
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('isAdmin', isAdmin);
}

function loadState() {
    const savedUserData = localStorage.getItem('userData');
    const savedSettings = localStorage.getItem('platformSettings');
    const savedLoggedIn = localStorage.getItem('isLoggedIn');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    const savedAllUsers = localStorage.getItem('allUsers'); 

    if (savedSettings) {
        platformSettings = JSON.parse(savedSettings);
    }
    if (savedAllUsers) {
        allUsers = JSON.parse(savedAllUsers);
    }

    if (savedUserData && savedUserData !== 'null') {
        userData = JSON.parse(savedUserData); 
    }

    isLoggedIn = savedLoggedIn === 'true';
    isAdmin = savedIsAdmin === 'true';
}

function displayMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.className = `mt-4 text-center text-sm fade-in ${isError ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}`;
    authMessage.classList.remove('hidden');
    setTimeout(() => {
        authMessage.classList.add('hidden');
    }, 3000);
}

// Helper to generate a unique referral code
function generateUniqueReferralCode(username) {
    // Format: First 3 letters of username + 5 random digits (e.g., UTH12345)
    const prefix = username.toUpperCase().slice(0, 3);
    const randomSuffix = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    
    let code = prefix + randomSuffix;
    
    // Simple check to ensure code isn't already used (high chance of being unique anyway)
    while (Object.values(allUsers).some(user => user.referralCode === code)) {
        code = prefix + Math.floor(10000 + Math.random() * 90000);
    }
    return code;
}


// --- Dashboard Rendering Functions (Snipped for focus) ---

function updateDashboard() {
    if (!userDashboard) return;
    userDashboard.classList.add('fade-in');
    
    userWelcome.textContent = `Welcome, ${userData.username}!`;
    userCoins.textContent = userData.coins.toLocaleString();
    referralBonus.textContent = userData.referralBonus.toLocaleString();
    totalBalance.textContent = (userData.coins + userData.taskEarnings + userData.referralBonus).toLocaleString();
    myReferralCode.value = userData.referralCode;
    totalReferrals.textContent = userData.totalReferrals;
    
    updateDailyClaimStatus();

    if (platformSettings.withdrawalOpen) {
        withdrawalClosed.classList.add('hidden');
        withdrawalOpen.classList.remove('hidden');
    } else {
        withdrawalClosed.classList.remove('hidden');
        withdrawalOpen.classList.add('hidden');
    }
    minWithdrawal.textContent = platformSettings.minWithdrawal;

    populateNews();
    populateNotifications();
    populateAchievements();
    populateTransactions();
    populateTasks();
}

function updateAdminDashboard() {
    if (!adminDashboard) return;
    adminDashboard.classList.add('fade-in');
    
    const userCount = Object.keys(allUsers).length;
    totalSignups.textContent = userCount.toLocaleString();
    
    const blockedUserCount = Object.values(allUsers).filter(user => user.isBlocked).length;
    blockedUsers.textContent = blockedUserCount; 
    
    pendingTasks.textContent = platformSettings.tasks.length; 
    document.getElementById('todaySignups').textContent = '25'; // Mock
    document.getElementById('activeUsers').textContent = '150'; // Mock
    document.getElementById('totalEarnings').textContent = '5,400,000'; // Mock

    toggleWithdrawal.textContent = platformSettings.withdrawalOpen ? 'Open' : 'Closed';
    toggleWithdrawal.classList.toggle('bg-red-500', !platformSettings.withdrawalOpen);
    toggleWithdrawal.classList.toggle('bg-green-500', platformSettings.withdrawalOpen);
    minWithdrawalInput.value = platformSettings.minWithdrawal;
    
    populateAdminTaskManagement();
    populateAdminMessageReplies();
}

// NOTE: All other rendering functions (populateNews, populateTasks, etc.) are omitted 
// here for brevity but should remain in your script block exactly as they were.


// --- Event Handlers Initialization ---

function initEventHandlers() {
    // Auth Tab Switching (Omitted for brevity)
    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white', 'shadow-lg');
            loginTab.classList.remove('bg-transparent', 'text-purple-600', 'shadow-none');
            signupTab.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white', 'shadow-lg');
            signupTab.classList.add('bg-transparent', 'text-purple-600', 'shadow-none');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });

        signupTab.addEventListener('click', () => {
            signupTab.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white', 'shadow-lg');
            signupTab.classList.remove('bg-transparent', 'text-purple-600', 'shadow-none');
            loginTab.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white', 'shadow-lg');
            loginTab.classList.add('bg-transparent', 'text-purple-600', 'shadow-none');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Login Submission (Omitted for brevity)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                isLoggedIn = true;
                isAdmin = true;
                userData.username = username; 
            } else if (allUsers[username] && allUsers[username].password === password) { 
                const user = allUsers[username];
                if (user.isBlocked) {
                    displayMessage('Account blocked. Please contact support.', true);
                    return;
                }
                isLoggedIn = true;
                isAdmin = false;
                userData = user;
            } else {
                displayMessage('Invalid username or password.', true);
                return;
            }

            displayMessage(`Login successful! Redirecting...`, false);
            saveState(); 
            setTimeout(initializeApp, 1000);
        });
    }

    // 🌟 --- CORE REFERRAL LOGIC IN SIGNUP --- 🌟
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const countryCode = document.getElementById('signupCountryCode').value;
            const whatsapp = document.getElementById('signupWhatsapp').value;
            // Get the referral code entered by the new user
            const enteredReferralCode = document.getElementById('referralCode').value.trim().toUpperCase();

            if (password !== confirmPassword) {
                displayMessage('Passwords do not match!', true);
                return;
            }
            if (allUsers[username] || username.toLowerCase() === ADMIN_USERNAME) {
                displayMessage('Username already taken or reserved.', true);
                return;
            }

            // --- Referral Processing ---
            let referrerUsername = null;
            let referrerUser = null;

            // 1. Find the referrer by code
            referrerUser = Object.values(allUsers).find(user => user.referralCode === enteredReferralCode);

            if (referrerUser) {
                // If a referrer is found, store their username
                referrerUsername = referrerUser.username;
            } else if (enteredReferralCode !== 'NONE' && enteredReferralCode !== '') {
                // If code is entered but invalid, warn the user but proceed (optional: you could block signup here)
                displayMessage('Warning: Invalid referral code entered. Proceeding without bonus.', false);
            }
            // ---------------------------
            
            // Generate NEW user's unique referral code
            const uniqueReferralCode = generateUniqueReferralCode(username);

            // Calculate bonuses
            const signupBonus = referrerUser ? platformSettings.referralSignupBonus : 0;
            const referrerBonus = referrerUser ? platformSettings.referralGiverBonus : 0;

            // Create the new user object
            const newUser = {
                ...userData, // Start with default structure
                username: username,
                password: password, 
                coins: signupBonus, 
                referralBonus: 0,
                totalReferrals: 0,
                referralCode: uniqueReferralCode, // Assign the unique code
                countryCode: countryCode,
                whatsappNumber: whatsapp,
                notifications: [{ id: Date.now() + 1, message: `Welcome bonus: ${signupBonus} Coins (Referred by ${referrerUsername || 'N/A'}).`, time: new Date().toLocaleTimeString(), read: false }],
                transactions: [{
                    description: `Signup Bonus (Referred by ${referrerUsername || 'N/A'})`,
                    amount: signupBonus,
                    type: 'credit'
                }],
            };

            // 2. Update the REFERRER if found
            if (referrerUser) {
                // IMPORTANT: Work directly on the object in allUsers for persistence
                referrerUser.coins += referrerBonus;
                referrerUser.referralBonus += referrerBonus;
                referrerUser.totalReferrals += 1;
                
                referrerUser.notifications.push({
                    id: Date.now(),
                    message: `🎉 Success! ${username} signed up using your code. You earned ${referrerBonus} coins!`,
                    time: new Date().toLocaleTimeString(),
                    read: false
                });

                referrerUser.transactions.push({
                    description: `Referral Bonus from ${username}`,
                    amount: referrerBonus,
                    type: 'credit'
                });
                
                // Update the master list with modified referrer
                allUsers[referrerUser.username] = referrerUser;
            }
            
            // 3. Add the NEW user to the master list
            allUsers[username] = newUser;
            
            // 4. Log the new user in
            isLoggedIn = true;
            isAdmin = false;
            userData = newUser; 

            displayMessage(`Account created! Welcome, ${username}. You received ${signupBonus} coins.`, false);
            saveState(); // Saves allUsers (including referrer and new user)
            setTimeout(initializeApp, 1000);
        });
    }
    // -----------------------------------------------------------------

    // --- General Dashboard Actions (Omitted for brevity) ---
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);
    
    // Daily Claim (Omitted for brevity)
    // Copy Referral Code
    if (copyReferralBtn && myReferralCode) {
        copyReferralBtn.addEventListener('click', () => {
            myReferralCode.select();
            document.execCommand('copy');
            alert('Referral Code Copied!');
        });
    }

    // Admin Control Handlers (Omitted for brevity)
    if (toggleWithdrawal) {
        toggleWithdrawal.addEventListener('click', () => {
            platformSettings.withdrawalOpen = !platformSettings.withdrawalOpen;
            saveState(); 
            updateAdminDashboard();
            updateDashboard();
        });
    }

    // Task completion, messages, other handlers... (Omitted for brevity)
}

function handleLogout() {
    isLoggedIn = false;
    isAdmin = false;
    saveState();
    initializeApp();
}

// Initialize the Application (Omitted for brevity)
function initializeApp() {
    loadState();
    
    if (authPage) authPage.classList.add('hidden');
    if (userDashboard) userDashboard.classList.add('hidden');
    if (adminDashboard) adminDashboard.classList.add('hidden');

    if (isLoggedIn) {
        if (isAdmin) {
            if (adminDashboard) adminDashboard.classList.remove('hidden');
            updateAdminDashboard();
        } else {
            if (userDashboard) userDashboard.classList.remove('hidden');
            updateDashboard();
        }
        if (telegramFloat) telegramFloat.classList.remove('hidden');
    } else {
        if (authPage) authPage.classList.remove('hidden');
        if (telegramFloat) telegramFloat.classList.remove('hidden');
    }
}

// This ensures all functions only run AFTER the HTML elements (buttons, forms, etc.) 
// are fully rendered and available in the document.
// ... [REST OF YOUR JAVASCRIPT CODE] ...

// ----------------------------------------------------
// THESE SHOULD BE THE FINAL EXECUTABLE LINES OF THE SCRIPT
// ----------------------------------------------------

// 1. Attach all event listeners to the now-existing DOM elements
initEventHandlers(); 

// 2. Run the main initialization function to load state and show the correct view
initializeApp();

// 3. Start the continuous check for the Daily Claim Timer (if applicable)
if (isLoggedIn && !isAdmin && userData.lastClaimTime > 0) {
    setInterval(updateDailyClaimStatus, 1000);
}
});

