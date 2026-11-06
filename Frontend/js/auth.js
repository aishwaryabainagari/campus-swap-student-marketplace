document.addEventListener("DOMContentLoaded", function () {
    // =====================================
    // REGISTRATION
    // =====================================

    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const message = document.getElementById("register-message");
            const submitButton = registerForm.querySelector(
                '[type="submit"]'
            );

            const name = document.getElementById("full-name").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const college = document.getElementById("college").value.trim();
            const studentId = document.getElementById("student-id").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            const terms = document.getElementById("terms").checked;

            function showMessage(text, color) {
                message.textContent = text;
                message.style.color = color;
            }

            if (!name || !email || !college || !studentId || !password) {
                showMessage("Please fill in all required fields.", "red");
                return;
            }

            if (password.length < 8) {
                showMessage("Password must contain at least 8 characters.", "red");
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", "red");
                return;
            }

            if (!terms) {
                showMessage("Please accept the terms and conditions.", "red");
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Creating account...";
            }

            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name,
                            college: college,
                            student_id: studentId
                        }
                    }
                });

                if (error) throw error;

                if (data.session && data.user) {
                    localStorage.setItem(
                        "campusSwapCurrentUser",
                        JSON.stringify({
                            id: data.user.id,
                            name: name,
                            email: data.user.email,
                            college: college,
                            studentId: studentId
                        })
                    );

                    showMessage("Registration successful! Opening your dashboard...", "green");

                    window.location.href = "dashboard.html";
                } else {
                    showMessage(
                        "Registration successful! Check your email to confirm your account, then log in.",
                        "green"
                    );

                    registerForm.reset();
                }

            } catch (error) {
                console.error("Registration error:", error);
                showMessage(
                    error.message || "Unable to create your account.",
                    "red"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Create Account";
                }
            }
        });
    }

    // =====================================
    // LOGIN
    // =====================================

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("login-email")
                .value.trim().toLowerCase();

            const password = document.getElementById("login-password").value;
            const message = document.getElementById("login-message");
            const submitButton = loginForm.querySelector('[type="submit"]');

            function showMessage(text, color) {
                message.textContent = text;
                message.style.color = color;
            }

            if (!email || !password) {
                showMessage("Enter your email and password.", "red");
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Logging in...";
            }

            try {
                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                if (error) throw error;

                const user = data.user;
                const metadata = user.user_metadata || {};

                localStorage.setItem(
                    "campusSwapCurrentUser",
                    JSON.stringify({
                        id: user.id,
                        name: metadata.full_name || "",
                        email: user.email,
                        college: metadata.college || "",
                        studentId: metadata.student_id || ""
                    })
                );

                window.location.href = "dashboard.html";

            } catch (error) {
                console.error("Login error:", error);
                showMessage(
                    error.message || "Unable to log in.",
                    "red"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Login";
                }
            }
        });
    }

    // =====================================
    // LOGOUT
    // =====================================

    const logoutButtons = [
        document.getElementById("header-logout"),
        document.getElementById("logout-btn")
    ].filter(Boolean);

    logoutButtons.forEach(function (button) {
        button.addEventListener("click", async function () {
            if (!window.confirm("Are you sure you want to log out?")) {
                return;
            }

            try {
                const { error } = await supabaseClient.auth.signOut();

                if (error) throw error;

                localStorage.removeItem("campusSwapCurrentUser");
                window.location.href = "login.html";

            } catch (error) {
                console.error("Logout error:", error);
                alert("Unable to log out. Please try again.");
            }
        });
    });
});
