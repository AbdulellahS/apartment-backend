const apiBaseURL = "https://apartment-backend-2qwi.onrender.com/api"; // API Base URL

// Utility: Check Login
function checkLogin() {
    const email = localStorage.getItem('email');
    if (!email && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    }
    return email;
}

// Utility: Logout Function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Login Function
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${apiBaseURL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            alert(error.message || "Invalid credentials.");
            console.error("Login Error:", error);
            return;
        }

        localStorage.setItem('email', email);
        window.location.href = 'main.html';
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Login failed. Please check the backend connection.");
    }
}

// Register User
async function register(event) {
    event.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;

    try {
        const res = await fetch(`${apiBaseURL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, phone }),
        });

        if (!res.ok) {
            const error = await res.json();
            alert(error.message || "Registration failed.");
            console.error("Registration Error:", error);
            return;
        }

        localStorage.setItem('email', email);
        window.location.href = 'profile.html';
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Failed to register. Please check the backend connection.");
    }
}

// Add Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', login);
    }

    if (document.getElementById('register-form')) {
        document.getElementById('register-form').addEventListener('submit', register);
    }
});