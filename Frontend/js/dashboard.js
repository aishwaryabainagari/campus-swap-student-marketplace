const API_URL = "http://localhost:3000/api/products";

document.addEventListener("DOMContentLoaded", function () {
    const nameElement = document.getElementById("dashboard-name");
    const emailElement = document.getElementById("dashboard-email");
    const loginMessage = document.getElementById("dashboard-login");
    const totalListings = document.getElementById("total-listings");
    const emptyMessage = document.getElementById("empty-listings");

    const listingsContainer =
        document.getElementById("my-listings-container");

    const logoutButton = document.getElementById("logout-btn");

    // =====================================
    // 1. HELPER FUNCTIONS
    // =====================================

    function getCachedUser() {
        try {
            const savedUser = localStorage.getItem(
                "campusSwapCurrentUser"
            );

            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Unable to load student profile:", error);
            return null;
        }
    }

    function showMessage(text) {
        if (!listingsContainer) return;

        listingsContainer.innerHTML = "";

        const paragraph = document.createElement("p");
        paragraph.textContent = text;

        listingsContainer.appendChild(paragraph);
    }

    function showEmptyMessage(text) {
        if (emptyMessage) {
            emptyMessage.style.display = "block";
            emptyMessage.textContent = text;
        }
    }

    // Get the real Supabase session, not just the localStorage profile.
    async function getCurrentSession() {
        if (typeof supabaseClient === "undefined") {
            throw new Error(
                "Supabase is not configured. Check dashboard.html scripts."
            );
        }

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error("Please log in again.");
        }

        return data.session;
    }

    // =====================================
    // 2. CURRENT USER AND PROFILE
    // =====================================

    let currentUser = getCachedUser();
    let currentSession = null;

    // =====================================
    // 3. LOGOUT
    // =====================================

    if (logoutButton) {
        logoutButton.style.display = "inline-block";

        logoutButton.addEventListener("click", async function () {
            const confirmed = window.confirm(
                "Are you sure you want to log out?"
            );

            if (!confirmed) return;

            logoutButton.disabled = true;

            try {
                if (typeof supabaseClient !== "undefined") {
                    const { error } =
                        await supabaseClient.auth.signOut();

                    if (error) {
                        throw error;
                    }
                }

                localStorage.removeItem("campusSwapCurrentUser");

                window.location.href = "login.html";

            } catch (error) {
                console.error("Logout error:", error);

                alert(
                    "Unable to log out properly. Please try again."
                );

                logoutButton.disabled = false;
            }
        });
    }

    // =====================================
    // 4. DISPLAY STUDENT PROFILE
    // =====================================

    function displayProfile(user) {
        if (nameElement) {
            nameElement.textContent =
                user.name || "Student";
        }

        if (emailElement) {
            emailElement.textContent =
                user.email || "";
        }

        if (loginMessage) {
            loginMessage.textContent =
                "Welcome, " + (user.name || "Student") + "!";

            loginMessage.removeAttribute("href");
            loginMessage.style.pointerEvents = "none";
        }
    }

    // =====================================
    // 5. LOAD STUDENT LISTINGS
    // =====================================

    async function loadMyListings() {
        if (totalListings) {
            totalListings.textContent = "0";
        }

        try {
            currentSession = await getCurrentSession();

            // Use the authenticated Supabase identity.
            const authenticatedUser = currentSession.user;

            currentUser = {
                ...(currentUser || {}),
                id: authenticatedUser.id,
                email: authenticatedUser.email || "",
                name:
                    authenticatedUser.user_metadata?.full_name ||
                    authenticatedUser.user_metadata?.name ||
                    currentUser?.name ||
                    ""
            };

            if (!currentUser.email) {
                throw new Error(
                    "Your account email could not be found. Please log in again."
                );
            }

            displayProfile(currentUser);

            if (listingsContainer) {
                listingsContainer.textContent =
                    "Loading your listings...";
            }

            if (emptyMessage) {
                emptyMessage.style.display = "none";
            }

            // Fetch public product listings.
            const response = await fetch(API_URL);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to retrieve products."
                );
            }

            if (!Array.isArray(result.products)) {
                throw new Error(
                    "Invalid product data received."
                );
            }

            // Match using the actual Supabase user ID.
            // Older listings without owner_id will not match.
            const myListings = result.products.filter(function (item) {
                return (
                    item.owner_id &&
                    item.owner_id === authenticatedUser.id
                );
            });

            displayListings(myListings);

        } catch (error) {
            console.error("Dashboard loading error:", error);

            if (loginMessage) {
                loginMessage.textContent = "Login";
                loginMessage.href = "login.html";
                loginMessage.style.pointerEvents = "auto";
            }

            if (nameElement) {
                nameElement.textContent = "Guest Student";
            }

            if (emailElement) {
                emailElement.textContent =
                    "Please log in to view your profile.";
            }

            if (totalListings) {
                totalListings.textContent = "0";
            }

            showEmptyMessage(
                error.message || "Unable to load your listings."
            );

            showMessage(
                error.message ||
                "Unable to load your listings. Please try again."
            );
        }
    }

    // =====================================
    // 6. DISPLAY LISTING CARDS
    // =====================================

    function displayListings(myListings) {
        if (totalListings) {
            totalListings.textContent = myListings.length;
        }

        if (emptyMessage) {
            emptyMessage.style.display =
                myListings.length === 0 ? "block" : "none";

            emptyMessage.textContent =
                "You have not listed any items yet.";
        }

        if (!listingsContainer) return;

        listingsContainer.innerHTML = "";

        if (myListings.length === 0) {
            showMessage(
                "You have not listed any items yet."
            );

            return;
        }

        myListings.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "product-card";

            // Product name
            const name = document.createElement("h3");
            name.textContent = item.name || "Unnamed Item";

            // Product price
            const price = document.createElement("p");
            price.textContent = "Price: ₹" + item.price;

            // Product condition
            const condition = document.createElement("p");
            condition.textContent =
                "Condition: " + (item.condition || "Not specified");

            // Product category
            const category = document.createElement("p");
            category.textContent =
                "Category: " + (item.category || "Uncategorized");

            // View details button
            const detailsLink = document.createElement("a");

            detailsLink.href =
                "product-details.html?id=" +
                encodeURIComponent(item.id);

            detailsLink.className = "view-btn";
            detailsLink.textContent = "View Details";

            // Edit listing button
            const editLink = document.createElement("a");

            editLink.href =
                "sell-item.html?edit=" +
                encodeURIComponent(item.id);

            editLink.className = "view-btn";
            editLink.textContent = "Edit Listing";

            // Delete listing button
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete Listing";

            deleteButton.addEventListener(
                "click",
                async function () {
                    const confirmed = window.confirm(
                        `Are you sure you want to delete "${item.name}"?`
                    );

                    if (!confirmed) return;

                    deleteButton.disabled = true;
                    deleteButton.textContent = "Deleting...";

                    try {
                        // Get a fresh session before deletion.
                        const session = await getCurrentSession();

                        const response = await fetch(
                            `${API_URL}/${encodeURIComponent(item.id)}`,
                            {
                                method: "DELETE",

                                headers: {
                                    "Authorization":
                                        `Bearer ${session.access_token}`
                                }
                            }
                        );

                        const result = await response.json();

                        if (!response.ok || !result.success) {
                            throw new Error(
                                result.message ||
                                "Unable to delete the listing."
                            );
                        }

                        alert("Listing deleted successfully!");

                        await loadMyListings();

                    } catch (error) {
                        console.error(
                            "Delete listing error:",
                            error
                        );

                        alert(
                            error.message ||
                            "Unable to delete the listing."
                        );

                        deleteButton.disabled = false;
                        deleteButton.textContent = "Delete Listing";
                    }
                }
            );

            // Add elements to the card.
            card.append(
                name,
                price,
                condition,
                category,
                detailsLink,
                editLink,
                deleteButton
            );

            listingsContainer.appendChild(card);
        });
    }

    // =====================================
    // 7. INITIALIZE DASHBOARD
    // =====================================

    loadMyListings();
});