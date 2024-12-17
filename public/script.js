// Fetch Expenses
fetch('/api/expenses')
  .then((response) => response.json())
  .then((data) => {
    console.log('Expenses:', data);
    // Use data to populate the expenses list in your frontend
  })
  .catch((err) => console.error('Error:', err));

  const translations = {
    en: {
        title: "Your Profile",
        name: "Name",
        phone: "Phone",
        photo: "Profile Photo",
        save: "Save Profile",
        logout: "Logout",
        main: "Main Page",
        addExpense: "Add Expense",
        filter: "Filter",
        expense: "Expenses"
    },
    ar: {
        title: "ملفك الشخصي",
        name: "الاسم",
        phone: "الهاتف",
        photo: "صورة الملف الشخصي",
        save: "حفظ الملف",
        logout: "تسجيل الخروج",
        main: "الصفحة الرئيسية",
        addExpense: "إضافة مصروف",
        filter: "تصفية",
        expense: "المصروفات"
    }
};

// Function to switch language
function switchLanguage(lang) {
    document.getElementById('title').innerText = translations[lang].title;
    document.getElementById('name-label').innerText = translations[lang].name;
    document.getElementById('phone-label').innerText = translations[lang].phone;
    document.getElementById('save-btn').innerText = translations[lang].save;
    document.getElementById('logout-btn').innerText = translations[lang].logout;
    document.getElementById('main-btn').innerText = translations[lang].main;
    document.getElementById('filter-btn').innerText = translations[lang].filter;
    document.getElementById('expense-title').innerText = translations[lang].expense;

    // Add RTL for Arabic
    if (lang === 'ar') {
        document.body.style.direction = "rtl";
        document.body.style.textAlign = "right";
    } else {
        document.body.style.direction = "ltr";
        document.body.style.textAlign = "left";
    }
}