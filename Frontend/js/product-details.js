// =====================================
// 1. DISPLAY PRODUCT DETAILS
// =====================================

document.addEventListener("DOMContentLoaded", async function () {

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const nameElement = document.getElementById("detail-name");
    const priceElement = document.getElementById("detail-price");
    const imageElement = document.getElementById("detail-image");
    const conditionElement = document.getElementById("detail-condition");
    const descriptionElement = document.getElementById("detail-description");
    const sellerElement = document.getElementById("detail-seller");
    const contactButton = document.getElementById("contact-seller-btn");

    // =====================================
    // 2. CHECK PRODUCT ID
    // =====================================

    if (!productId) {
        if (nameElement) {
            nameElement.textContent = "Product Not Found";
        }

        if (descriptionElement) {
            descriptionElement.textContent = "Invalid product link.";
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
    // 3. CHECK REQUIRED FUNCTIONS
    // =====================================

    if (typeof loadProducts !== "function" ||
        typeof getAllProducts !== "function") {

        console.error("products.js is not loaded correctly.");

        if (nameElement) {
            nameElement.textContent = "Unable to Load Products";
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                "Please check the products.js script.";
        }

        return;
    }

    try {

        // =====================================
        // 4. LOAD PRODUCTS FROM BACKEND
        // =====================================

        if (nameElement) {
            nameElement.textContent = "Loading product...";
        }

        await loadProducts();

        // Find the selected product by its ID.
        const allProducts = getAllProducts();

        const product = allProducts.find(function (item) {
            return String(item.id) === String(productId);
        });

        // =====================================
        // 5. HANDLE PRODUCT NOT FOUND
        // =====================================

        if (!product) {

            if (nameElement) {
                nameElement.textContent = "Product Not Found";
            }

            if (priceElement) {
                priceElement.textContent = "";
            }

            if (conditionElement) {
                conditionElement.textContent = "";
            }

            if (descriptionElement) {
                descriptionElement.textContent =
                    "This product may have been removed or could not be loaded.";
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
        // 6. DISPLAY PRODUCT NAME
        // =====================================

        if (nameElement) {
            nameElement.textContent =
                product.name || "Unnamed Item";
        }

        // =====================================
        // 7. DISPLAY PRODUCT PRICE
        // =====================================

        if (priceElement) {
            priceElement.textContent =
                "₹" + (Number(product.price) || 0);
        }

        // =====================================
        // 8. DISPLAY PRODUCT CONDITION
        // =====================================

        if (conditionElement) {
            conditionElement.textContent =
                "Condition: " +
                (product.condition || "Not specified");
        }

        // =====================================
        // 9. DISPLAY PRODUCT DESCRIPTION
        // =====================================

        if (descriptionElement) {
            descriptionElement.textContent =
                product.description ||
                "No description available.";
        }

        // =====================================
        // 10. DISPLAY PRODUCT IMAGE
        // =====================================

        if (imageElement) {

            if (product.image && product.image.trim() !== "") {

                imageElement.style.display = "block";
                imageElement.src = product.image;
                imageElement.alt =
                    product.name || "Product image";

                imageElement.onerror = function () {
                    this.onerror = null;
                    this.style.display = "none";

                    console.error(
                        "Unable to load product image:",
                        product.image
                    );
                };

            } else {

                imageElement.style.display = "none";

                console.warn(
                    "No image is saved for this product."
                );
            }
        }

        // =====================================
        // 11. SELLER INFORMATION
        // =====================================
        // Seller information is intentionally hidden
        // because you do not want it on this page.

        if (sellerElement) {
            sellerElement.textContent = "";
            sellerElement.style.display = "none";
        }

        // =====================================
        // 12. CONTACT SELLER BUTTON
        // =====================================

        if (contactButton) {

            let currentUser = null;

            try {
                currentUser = JSON.parse(
                    localStorage.getItem("campusSwapCurrentUser")
                );
            } catch (error) {
                console.error(
                    "Unable to read current user:",
                    error
                );
            }

            const currentEmail = String(
                currentUser?.email || ""
            ).trim().toLowerCase();

            const sellerEmail = String(
                product.sellerEmail ||
                product.ownerEmail ||
                ""
            ).trim();

            const sellerEmailNormalized =
                sellerEmail.toLowerCase();

            // Logged-out users must log in first.
            if (!currentUser) {

                contactButton.textContent =
                    "Login to Contact Seller";

                const loginURL = new URL(
                    "login.html",
                    window.location.href
                );

                loginURL.searchParams.set(
                    "redirect",
                    window.location.href
                );

                contactButton.href = loginURL.href;
                contactButton.style.display = "inline-block";
                contactButton.style.pointerEvents = "auto";

                contactButton.removeAttribute(
                    "aria-disabled"
                );

            }

            // The current user owns this listing.
            else if (
                currentEmail &&
                sellerEmailNormalized &&
                currentEmail === sellerEmailNormalized
            ) {

                contactButton.textContent =
                    "This Is Your Listing";

                contactButton.removeAttribute("href");

                contactButton.style.pointerEvents = "none";

                contactButton.setAttribute(
                    "aria-disabled",
                    "true"
                );

            }

            // Seller email is available.
            else if (sellerEmail) {

                contactButton.textContent = "Email Seller";

                contactButton.href =
                    "mailto:" +
                    sellerEmail +
                    "?subject=" +
                    encodeURIComponent(
                        "Enquiry about " +
                        (product.name || "a Campus Swap item")
                    );

                contactButton.style.pointerEvents = "auto";

                contactButton.removeAttribute(
                    "aria-disabled"
                );

            }

            // Seller email is unavailable.
            else {

                contactButton.textContent =
                    "Seller Contact Unavailable";

                contactButton.removeAttribute("href");

                contactButton.style.pointerEvents = "none";

                contactButton.setAttribute(
                    "aria-disabled",
                    "true"
                );
            }
        }

    } catch (error) {

        // =====================================
        // 13. HANDLE LOADING ERRORS
        // =====================================

        console.error(
            "Error loading product details:",
            error
        );

        if (nameElement) {
            nameElement.textContent =
                "Unable to Load Product";
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                "Unable to retrieve product details. Please check your connection and try again.";
        }
    }
});
