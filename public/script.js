// General utility functions for all pages
const apiBaseURL = "https://apartment-backend-2qwi.onrender.com/api"; // API Base URL

// Check if the user is logged in
function checkLogin() {
    const email = localStorage.getItem('email');
    if (!email && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    }
    return email;
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Fetch and display expenses (main.html)
async function fetchExpenses() {
    try {
        const res = await fetch(`${apiBaseURL}/expenses`);
        const expenses = await res.json();
        displayExpenses(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

function displayExpenses(expenses) {
    const list = document.getElementById('expenses-list');
    list.innerHTML = '';
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <strong>${expense.description}</strong> - ${expense.amount} SAR <br>
                <small class="text-muted">${new Date(expense.date).toLocaleDateString()}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-warning me-2" onclick="editExpense('${expense._id}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense('${expense._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Add new expense
async function addExpense(event) {
    event.preventDefault();
    const email = checkLogin();
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;

    try {
        await fetch(`${apiBaseURL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, amount, description })
        });
        alert("Expense added successfully!");
        fetchExpenses();
        event.target.reset();
    } catch (error) {
        console.error("Error adding expense:", error);
        alert("Failed to add expense.");
    }
}

// Delete an expense
async function deleteExpense(id) {
    try {
        await fetch(`${apiBaseURL}/expenses/${id}`, { method: 'DELETE' });
        fetchExpenses();
    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}

// Profile: Fetch and display user profile data
async function fetchProfile() {
    const email = checkLogin();
    try {
        const res = await fetch(`${apiBaseURL}/get-profile?email=${email}`);
        if (res.ok) {
            const { name, phone, photo } = await res.json();
            document.getElementById('name').value = name || '';
            document.getElementById('phone').value = phone || '';
            document.getElementById('photo-preview').src = photo || 'default-avatar.png';
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// Profile: Update user profile
async function updateProfile(event) {
    event.preventDefault();
    const email = checkLogin();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', document.getElementById('name').value);
    formData.append('phone', document.getElementById('phone').value);

    const photo = document.getElementById('photo').files[0];
    if (photo) formData.append('photo', photo);

    try {
        const res = await fetch(`${apiBaseURL}/profile`, { method: 'POST', body: formData });
        if (res.ok) {
            alert("Profile updated successfully!");
            window.location.href = 'main.html';
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
    }
}

// Login function
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${apiBaseURL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            localStorage.setItem('email', email);
            window.location.href = 'main.html';
        } else {
            alert("Invalid credentials.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Error logging in.");
    }
}

// Event Listeners Initialization
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname;

    if (page.includes('main.html')) {
        checkLogin();
        fetchExpenses();
        document.getElementById('expense-form')?.addEventListener('submit', addExpense);
    } else if (page.includes('profile.html')) {
        fetchProfile();
        document.getElementById('profile-form')?.addEventListener('submit', updateProfile);
    } else if (page.includes('login.html')) {
        document.getElementById('login-form')?.addEventListener('submit', login);
    }
});