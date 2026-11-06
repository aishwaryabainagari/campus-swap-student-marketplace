require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("./supabase");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// =====================================
// CREATE AUTHENTICATED USER CLIENT
// =====================================

function createUserClient(accessToken) {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );
}

// =====================================
// AUTHENTICATION MIDDLEWARE
// =====================================

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || "";

        const accessToken = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : "";

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Please log in to continue."
            });
        }

        const { data, error } =
            await supabase.auth.getUser(accessToken);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Your session is invalid or expired. Please log in again."
            });
        }

        req.user = data.user;
        req.userSupabase = createUserClient(accessToken);

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Unable to verify your login."
        });
    }
}

// =====================================
// VALIDATE PRODUCT
// =====================================

function validateProduct(body) {
    const { name, category, price, condition } = body || {};

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof category !== "string" ||
        !category.trim() ||
        price === undefined ||
        price === null ||
        price === "" ||
        typeof condition !== "string" ||
        !condition.trim()
    ) {
        return "Name, category, price, and condition are required.";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return "Please enter a valid, non-negative price.";
    }

    return null;
}

// =====================================
// HOME ROUTE
// =====================================

app.get("/", (req, res) => {
    res.send("Welcome to Campus Swap Backend!");
});

// =====================================
// TEST ROUTE
// =====================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Campus Swap backend is working!"
    });
});

// =====================================
// GET ALL PRODUCTS
// Public product browsing
// =====================================

app.get("/api/products", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Fetch error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve products."
            });
        }

        return res.json({
            success: true,
            count: data.length,
            products: data
        });

    } catch (error) {
        console.error("Server error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// =====================================
// ADD PRODUCT
// Only authenticated users
// =====================================

app.post("/api/products", requireAuth, async (req, res) => {
    try {
        const validationError = validateProduct(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const {
            name,
            category,
            price,
            condition,
            image,
            description,
            sellerName
        } = req.body;

        // Use the verified user's identity.
        // Never trust owner_id or seller_email from the browser.
        const userEmail = req.user.email
            ? req.user.email.trim().toLowerCase()
            : null;

        const metadataName =
            req.user.user_metadata?.full_name ||
            req.user.user_metadata?.name ||
            null;

        const productData = {
            name: name.trim(),
            category: category.trim(),
            price: Number(price),
            condition: condition.trim(),

            image:
                typeof image === "string"
                    ? image.trim()
                    : null,

            description:
                typeof description === "string"
                    ? description.trim()
                    : null,

            seller_name:
                metadataName ||
                (typeof sellerName === "string"
                    ? sellerName.trim()
                    : null),

            seller_email: userEmail,
            owner_email: userEmail,
            owner_id: req.user.id
        };

        const { data, error } = await req.userSupabase
            .from("products")
            .insert([productData])
            .select()
            .single();

        if (error) {
            console.error("Insert error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to save the product. Check your database permissions."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Product added successfully!",
            product: data
        });

    } catch (error) {
        console.error("Add product error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// =====================================
// UPDATE PRODUCT
// Only the authenticated owner can update
// =====================================

app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
        const validationError = validateProduct(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const productId = req.params.id;

        const {
            name,
            category,
            price,
            condition,
            image,
            description
        } = req.body;

        const updatedProduct = {
            name: name.trim(),
            category: category.trim(),
            price: Number(price),
            condition: condition.trim(),

            image:
                typeof image === "string"
                    ? image.trim()
                    : null,

            description:
                typeof description === "string"
                    ? description.trim()
                    : null
        };

        const { data, error } = await req.userSupabase
            .from("products")
            .update(updatedProduct)
            .eq("id", productId)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Update error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to update the listing. Check your RLS policies."
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found, or you do not have permission to edit it."
            });
        }

        return res.json({
            success: true,
            message: "Listing updated successfully!",
            product: data
        });

    } catch (error) {
        console.error("Update error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// =====================================
// DELETE PRODUCT
// Only the authenticated owner can delete
// =====================================

app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
        const productId = req.params.id;

        const { data, error } = await req.userSupabase
            .from("products")
            .delete()
            .eq("id", productId)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Delete error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to delete the listing. Check your RLS policies."
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found, or you do not have permission to delete it."
            });
        }

        return res.json({
            success: true,
            message: "Listing deleted successfully!"
        });

    } catch (error) {
        console.error("Delete error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
    console.log(
        `Campus Swap server running at http://localhost:${PORT}`
    );
});