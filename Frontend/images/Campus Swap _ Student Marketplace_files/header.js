document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("header-login");
    const registerButton = document.getElementById("header-register");
    const dashboardButton = document.getElementById("header-dashboard");
    const logoutButton = document.getElementById("header-logout");

    let currentUser = null;

    try {
        currentUser = JSON.parse(
            localStorage.getItem("campusSwapCurrentUser")
        );
    } catch (error) {
        console.error("Unable to read login information:", error);
    }

    if (currentUser) {
        if (loginButton) loginButton.style.display = "none";
        if (registerButton) registerButton.style.display = "none";
        if (dashboardButton) dashboardButton.style.display = "inline-block";
        if (logoutButton) logoutButton.style.display = "inline-block";
    } else {
        if (loginButton) loginButton.style.display = "inline-block";
        if (registerButton) registerButton.style.display = "inline-block";
        if (dashboardButton) dashboardButton.style.display = "none";
        if (logoutButton) logoutButton.style.display = "none";
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            const confirmed = window.confirm(
                "Are you sure you want to log out?"
            );

            if (confirmed) {
                localStorage.removeItem("campusSwapCurrentUser");
                window.location.href = "login.html";
            }
        });
    }
});


