// =====================================
// 1. BACKEND API URL
// =====================================

const API_URL = "http://localhost:3000/api/products";


// =====================================
// 2. STORE PRODUCTS
// =====================================

let products = [];


// =====================================
// 3. GET ALL PRODUCTS
// =====================================

function getAllProducts() {
    return products;
}


// =====================================
// 4. LOAD PRODUCTS FROM BACKEND
// =====================================

async function loadProducts() {
    const container = document.getElementById("product-container");
    const noResults = document.getElementById("no-results");

    if (container) {
        container.innerHTML = "<p>Loading products...</p>";
    }

    try {
        // Request product data from the backend.
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Unable to load products. HTTP status: " +
                response.status
            );
        }

        const result = await response.json();

        // Validate the backend response.
        if (!result.success || !Array.isArray(result.products)) {
            throw new Error(
                "Invalid response received from the server."
            );
        }

        // =====================================
        // 5. MAP DATABASE FIELDS TO FRONTEND
        // =====================================

        products = result.products.map(function (item) {
            return {
                id: item.id,
                name: item.name || "Unnamed Item",
                category: item.category || "",
                price: Number(item.price) || 0,
                condition: item.condition || "",
                image: item.image || "",
                description: item.description || "",

                // Database columns use snake_case.
                // Frontend code uses camelCase.
                sellerName:
                    item.seller_name ||
                    item.sellerName ||
                    "Campus Swap Student",

                sellerEmail:
                    item.seller_email ||
                    item.sellerEmail ||
                    "",

                ownerEmail:
                    item.owner_email ||
                    item.ownerEmail ||
                    "",

                owner_id: item.owner_id || null,
                created_at: item.created_at || null
            };
        });

        // Display the products if this page has a product container.
        if (container) {
            displayProducts(products);
        }

        if (noResults && products.length > 0) {
            noResults.style.display = "none";
        }

        return products;

    } catch (error) {
        console.error("Product loading error:", error);

        if (container) {
            container.innerHTML = "";
        }

        if (noResults) {
            noResults.style.display = "block";
            noResults.textContent =
                "Unable to load products. Please check whether the backend server is running.";
        }

        // Let the calling page handle the error.
        throw error;
    }
}


// =====================================
// 6. DISPLAY PRODUCTS
// =====================================

function displayProducts(productList) {
    const container = document.getElementById("product-container");
    const noResults = document.getElementById("no-results");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(productList) || productList.length === 0) {
        if (noResults) {
            noResults.style.display = "block";
            noResults.textContent = "No products found.";
        }

        return;
    }

    if (noResults) {
        noResults.style.display = "none";
    }

    productList.forEach(function (product) {
        // Product card.
        const card = document.createElement("div");
        card.className = "product-card";

        // =====================================
        // PRODUCT IMAGE
        // =====================================

        const image = document.createElement("img");
        image.className = "product-image";
        image.alt = product.name || "Product image";

        if (product.image) {
            image.src = product.image;

            image.onerror = function () {
                this.onerror = null;
                this.style.display = "none";

                console.error(
                    "Unable to load image for:",
                    product.name,
                    product.image
                );
            };
        } else {
            image.style.display = "none";
        }

        // =====================================
        // PRODUCT INFORMATION
        // =====================================

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name || "Unnamed Item";

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = "₹" + (Number(product.price) || 0);

        const condition = document.createElement("p");
        condition.textContent =
            "Condition: " + (product.condition || "Not specified");

        // =====================================
        // VIEW DETAILS BUTTON
        // =====================================

        const button = document.createElement("a");
        button.className = "view-btn";
        button.textContent = "View Details";

        const detailsURL = new URL(
            "product-details.html",
            window.location.href
        );

        detailsURL.searchParams.set("id", String(product.id));
        button.href = detailsURL.href;

        // Add product information to the card.
        info.append(name, price, condition, button);
        card.append(image, info);

        container.appendChild(card);
    });
}


// =====================================
// 7. SEARCH PRODUCTS
// =====================================

function searchProducts(searchTerm) {
    const term = String(searchTerm || "")
        .trim()
        .toLowerCase();

    const filteredProducts = getAllProducts().filter(function (product) {
        return (
            String(product.name || "").toLowerCase().includes(term) ||
            String(product.category || "").toLowerCase().includes(term) ||
            String(product.description || "").toLowerCase().includes(term) ||
            String(product.condition || "").toLowerCase().includes(term)
        );
    });

    displayProducts(filteredProducts);
}


// =====================================
// 8. SORT PRODUCTS BY PRICE
// =====================================

function sortProductsByPrice(order) {
    const sortedProducts = [...getAllProducts()].sort(function (a, b) {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        if (order === "high-to-low") {
            return priceB - priceA;
        }

        return priceA - priceB;
    });

    displayProducts(sortedProducts);
}


// =====================================
// 9. SET UP SEARCH AND DISPLAY
// =====================================

document.addEventListener("DOMContentLoaded", async function () {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");

    // Load products from the backend.
    try {
        await loadProducts();
    } catch (error) {
        // loadProducts() already displays an error message.
    }

    // Search when the form is submitted.
    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            searchProducts(searchInput.value);
        });

        // Update search results while typing.
        searchInput.addEventListener("input", function () {
            searchProducts(searchInput.value);
        });
    }
});
