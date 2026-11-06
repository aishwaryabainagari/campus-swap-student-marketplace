// =====================================
// 1. DISPLAY PRODUCT DETAILS
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const nameElement = document.getElementById("detail-name");
    const priceElement = document.getElementById("detail-price");
    const imageElement = document.getElementById("detail-image");
    const conditionElement = document.getElementById("detail-condition");
    const descriptionElement =
        document.getElementById("detail-description");
    const sellerElement = document.getElementById("detail-seller");
    const contactButton =
        document.getElementById("contact-seller-btn");

    // =====================================
    // 2. GET PRODUCT DATA
    // =====================================

    if (typeof getAllProducts !== "function") {
        console.error(
            "getAllProducts() is unavailable. Check the products.js script path."
        );

        if (nameElement) {
            nameElement.textContent = "Unable to Load Products";
        }

        if (conditionElement) {
            conditionElement.textContent =
                "Please check that products.js is loaded correctly.";
        }

        return;
    }

    const allProducts = getAllProducts();

    // Find the product using its ID
    const product = allProducts.find(function (item) {
        return (
            item.id !== undefined &&
            item.id !== null &&
            String(item.id) === String(productId)
        );
    });

    // =====================================
    // 3. HANDLE MISSING PRODUCTS
    // =====================================

    if (!product || productId === null) {
        if (nameElement) {
            nameElement.textContent = "Product Not Found";
        }

        if (priceElement) {
            priceElement.textContent = "";
        }

        if (conditionElement) {
            conditionElement.textContent =
                "This product may have been removed or the link is invalid.";
        }

        if (descriptionElement) {
            descriptionElement.textContent = "";
        }

        if (sellerElement) {
            sellerElement.textContent = "";
        }

        if (imageElement) {
            imageElement.style.display = "none";
        }

        if (contactButton) {
            contactButton.style.display = "none";
        }

        return;
    }

    // =====================================
    // 4. DISPLAY PRODUCT INFORMATION
    // =====================================

    if (nameElement) {
        nameElement.textContent = product.name || "Unnamed Item";
    }

    if (priceElement) {
        priceElement.textContent = "₹" + (Number(product.price) || 0);
    }

    if (conditionElement) {
        conditionElement.textContent =
            "Condition: " + (product.condition || "Not specified");
    }

    if (descriptionElement) {
        descriptionElement.textContent =
            product.description || "No description available.";
    }

    if (imageElement) {
        if (product.image) {
            imageElement.style.display = "block";
            imageElement.src = product.image;
            imageElement.alt = product.name || "Product image";

            imageElement.onerror = function () {
                this.onerror = null;
                this.style.display = "none";
            };
        } else {
            imageElement.style.display = "none";
        }
    }

    // =====================================
    // 5. DISPLAY SELLER INFORMATION
    // =====================================

    const sellerName =
        product.sellerName ||
        product.ownerName ||
        "Campus Swap Student";

    if (sellerElement) {
        sellerElement.textContent = "Seller: " + sellerName;
    }

    // Support listings that use either sellerEmail or ownerEmail
    const sellerEmail =
        product.sellerEmail ||
        product.ownerEmail ||
        "";

    // =====================================
    // 6. CONTACT SELLER
    // =====================================

    if (contactButton) {
        let currentUser = null;

        try {
            currentUser = JSON.parse(
                localStorage.getItem("campusSwapCurrentUser")
            );
        } catch (error) {
            console.error("Unable to read current user:", error);
        }

        const currentEmail = String(
            currentUser && currentUser.email
                ? currentUser.email
                : ""
        ).trim().toLowerCase();

        const sellerEmailNormalized = String(sellerEmail)
            .trim()
            .toLowerCase();

        // Logged-out users must log in first
        if (!currentUser) {
            contactButton.textContent = "Login to Contact Seller";

            const loginURL = new URL(
                "login.html",
                window.location.href
            );

            loginURL.searchParams.set(
                "redirect",
                window.location.href
            );

            contactButton.href = loginURL.href;
            contactButton.style.pointerEvents = "auto";
            contactButton.removeAttribute("aria-disabled");
            contactButton.style.display = "inline-block";
        }

        // The logged-in user owns this listing
        else if (
            currentEmail &&
            sellerEmailNormalized &&
            currentEmail === sellerEmailNormalized
        ) {
            contactButton.textContent = "This Is Your Listing";
            contactButton.removeAttribute("href");
            contactButton.style.pointerEvents = "none";
            contactButton.setAttribute("aria-disabled", "true");
        }

        // Seller email is available
        else if (sellerEmail.trim()) {
            contactButton.textContent = "Email Seller";

            contactButton.href =
                "mailto:" +
                encodeURIComponent(sellerEmail.trim()) +
                "?subject=" +
                encodeURIComponent(
                    "Enquiry about " +
                    (product.name || "a Campus Swap item")
                );

            contactButton.style.pointerEvents = "auto";
            contactButton.removeAttribute("aria-disabled");
        }

        // No seller email is available
        else {
            contactButton.textContent = "Seller Contact Unavailable";
            contactButton.removeAttribute("href");
            contactButton.style.pointerEvents = "none";
            contactButton.setAttribute("aria-disabled", "true");
        }
    }
});