const API_URL = "http://localhost:3000/api/products";

document.addEventListener("DOMContentLoaded", function () {
    const sellForm = document.getElementById("sell-form");

    if (!sellForm) return;

    const message = document.getElementById("sell-message");

    const itemNameInput = document.getElementById("item-name");
    const categoryInput = document.getElementById("item-category");
    const priceInput = document.getElementById("item-price");
    const conditionInput = document.getElementById("item-condition");
    const descriptionInput = document.getElementById("item-description");
    const sellerNameInput = document.getElementById("seller-name");
    const sellerEmailInput = document.getElementById("seller-email");

    let editingItemId = new URLSearchParams(
        window.location.search
    ).get("edit");

    let isSubmitting = false;
    let editListingLoaded = !editingItemId;

    // =====================================
    // 1. HELPER FUNCTIONS
    // =====================================

    function showMessage(text, color) {
        if (!message) return;

        message.textContent = text;
        message.style.color = color;
    }

    function getCachedUser() {
        try {
            const savedUser = localStorage.getItem(
                "campusSwapCurrentUser"
            );

            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Unable to read cached user:", error);
            return null;
        }
    }

    // Get the actual authenticated Supabase session.
    async function getCurrentSession() {
        if (typeof supabaseClient === "undefined") {
            throw new Error(
                "Supabase is not configured. Check the scripts in sell-item.html."
            );
        }

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error(
                "Please log in again. Your Supabase session is missing."
            );
        }

        return data.session;
    }

    function setEditMode() {
        const heading = sellForm.querySelector("h2");

        const submitButton = sellForm.querySelector(
            '[type="submit"]'
        );

        if (heading) {
            heading.textContent = "Edit Your Listing";
        }

        if (submitButton) {
            submitButton.textContent = "Save Changes";
        }
    }

    function setFormDisabled(disabled) {
        sellForm.querySelectorAll(
            "input, select, textarea, button"
        ).forEach(function (element) {
            element.disabled = disabled;
        });
    }

    // =====================================
    // 2. CHECK AUTHENTICATION
    // =====================================

    let currentUser = getCachedUser();
    let currentEmail = "";

    async function initialize() {
        try {
            const session = await getCurrentSession();

            currentEmail = (
                session.user.email || ""
            ).trim().toLowerCase();

            // Use the authenticated Supabase user.
            currentUser = {
                ...(currentUser || {}),

                id: session.user.id,

                email: session.user.email || "",

                name:
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    currentUser?.name ||
                    ""
            };

            if (!currentEmail) {
                throw new Error(
                    "Your account has no email address. Please check your login."
                );
            }

            if (sellerNameInput) {
                sellerNameInput.value = currentUser.name;
                sellerNameInput.readOnly = true;
            }

            if (sellerEmailInput) {
                sellerEmailInput.value = currentUser.email;
                sellerEmailInput.readOnly = true;
            }

            // Load the product when editing.
            if (editingItemId) {
                await loadListingForEditing();
            }

        } catch (error) {
            console.error(
                "Authentication/setup error:",
                error
            );

            showMessage(
                error.message ||
                "Please log in before listing or editing an item.",
                "red"
            );

            setFormDisabled(true);
        }
    }

    // =====================================
    // 3. LOAD PRODUCT FOR EDITING
    // =====================================

    async function loadListingForEditing() {
        setEditMode();

        editListingLoaded = false;

        showMessage(
            "Loading your listing...",
            "#243b64"
        );

        try {
            const response = await fetch(API_URL);

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Unable to retrieve products."
                );
            }

            const products = result.products || [];

            const product = products.find(function (item) {
                return String(item.id) === String(editingItemId);
            });

            if (!product) {
                throw new Error(
                    "Product not found in the database."
                );
            }

            // Verify that this listing belongs to the
            // currently authenticated Supabase user.
            if (
                !product.owner_id ||
                product.owner_id !== currentUser.id
            ) {
                throw new Error(
                    "This listing is not linked to your account. Older listings may need their owner_id assigned in Supabase."
                );
            }

            // Fill the form with the existing product details.
            itemNameInput.value = product.name || "";

            categoryInput.value = product.category || "";

            priceInput.value = product.price ?? "";

            conditionInput.value = product.condition || "";

            descriptionInput.value = product.description || "";

            editListingLoaded = true;

            showMessage(
                "Listing loaded. You can now edit the details.",
                "green"
            );

        } catch (error) {
            console.error(
                "Unable to load listing:",
                error
            );

            showMessage(
                error.message ||
                "Unable to load the product.",
                "red"
            );
        }
    }

    // =====================================
    // 4. SUBMIT FORM
    // ADD OR EDIT PRODUCT
    // =====================================

    sellForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            if (isSubmitting) return;

            if (
                editingItemId &&
                !editListingLoaded
            ) {
                showMessage(
                    "The listing has not loaded, or you don't own it. Please check and try again.",
                    "red"
                );

                return;
            }

            // Read form values.
            const name = itemNameInput.value.trim();

            const category = categoryInput.value.trim();

            const priceValue = priceInput.value.trim();

            const condition = conditionInput.value.trim();

            const description = descriptionInput.value.trim();

            // Validate required fields.
            if (
                !name ||
                !category ||
                !condition ||
                !description ||
                priceValue === ""
            ) {
                showMessage(
                    "Please complete all required fields.",
                    "red"
                );

                return;
            }

            const price = Number(priceValue);

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {
                showMessage(
                    "Please enter a valid, non-negative price.",
                    "red"
                );

                return;
            }

            isSubmitting = true;

            const submitButton = sellForm.querySelector(
                '[type="submit"]'
            );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Please wait...";
            }

            try {
                // Get the latest authenticated session.
                const session = await getCurrentSession();

                const accessToken = session.access_token;

                // Prepare the product data.
                // Ownership is determined by the backend
                // from the verified access token.
                const productData = {
                    name: name,
                    category: category,
                    price: price,
                    condition: condition,
                    image: "images/campus.jpg",
                    description: description,
                    sellerName: currentUser.name || ""
                };

                const isEditing = Boolean(editingItemId);

                const requestURL = isEditing
                    ? `${API_URL}/${encodeURIComponent(editingItemId)}`
                    : API_URL;

                // Add or edit the listing.
                const response = await fetch(
                    requestURL,
                    {
                        method: isEditing ? "PUT" : "POST",

                        headers: {
                            "Content-Type": "application/json",

                            "Authorization": `Bearer ${accessToken}`
                        },

                        body: JSON.stringify(productData)
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                        (
                            isEditing
                                ? "Unable to update the product."
                                : "Unable to add the product."
                        )
                    );
                }

                // Show success message.
                showMessage(
                    isEditing
                        ? "Listing updated successfully!"
                        : "Item listed successfully!",
                    "green"
                );

                // Reset the form after adding a new item.
                if (!isEditing) {
                    sellForm.reset();

                    if (sellerNameInput) {
                        sellerNameInput.value =
                            currentUser.name || "";
                    }

                    if (sellerEmailInput) {
                        sellerEmailInput.value =
                            currentUser.email || "";
                    }
                }

                // Redirect after successful operation.
                setTimeout(function () {
                    window.location.href = isEditing
                        ? "dashboard.html"
                        : "index.html";
                }, 1000);

            } catch (error) {
                console.error(
                    "Unable to save product:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to save the listing. Please try again.",
                    "red"
                );

            } finally {
                isSubmitting = false;

                if (submitButton) {
                    submitButton.disabled = false;

                    submitButton.textContent = editingItemId
                        ? "Save Changes"
                        : "List Item";
                }
            }
        }
    );

    // =====================================
    // 5. INITIALIZE PAGE
    // =====================================

    initialize();
});