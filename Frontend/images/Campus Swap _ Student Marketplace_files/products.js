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
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load products from the server.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.products)) {
            throw new Error("Invalid response received from the server.");
        }

        // Convert database field names into the names used by the frontend.
        products = result.products.map(function (item) {
            return {
                id: item.id,
                name: item.name,
                category: item.category,
                price: Number(item.price),
                condition: item.condition,
                image: item.image,
                description: item.description,
                sellerName: item.seller_name || "Campus Swap Student",
                sellerEmail: item.seller_email || "",
                ownerEmail: item.owner_email || ""
            };
        });

        displayProducts(products);

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
    }
}


// =====================================
// 5. DISPLAY PRODUCTS
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
        const card = document.createElement("div");
        card.className = "product-card";

        // Product image
        const image = document.createElement("img");
        image.className = "product-image";
        image.alt = product.name || "Product image";

        image.onerror = function () {
            this.onerror = null;
            this.style.display = "none";
        };

        if (product.image) {
            image.src = product.image;
        } else {
            image.style.display = "none";
        }

        // Product information
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

        // View Details link
        const button = document.createElement("a");
        button.className = "view-btn";
        button.textContent = "View Details";

        const detailsURL = new URL(
            "product-details.html",
            window.location.href
        );

        detailsURL.searchParams.set("id", String(product.id));
        button.href = detailsURL.href;

        info.append(name, price, condition, button);
        card.append(image, info);
        container.appendChild(card);
    });
}


// =====================================
// 6. SEARCH PRODUCTS
// =====================================

function searchProducts(searchTerm) {
    const term = String(searchTerm || "").trim().toLowerCase();

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
// 7. SORT PRODUCTS BY PRICE
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
// 8. SET UP SEARCH AND DISPLAY
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");

    // Fetch products from the backend.
    loadProducts();

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