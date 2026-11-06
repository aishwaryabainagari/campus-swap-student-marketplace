# Campus Swap – Student Marketplace

A student marketplace where college students can buy and sell academic and educational items such as textbooks, calculators, class notes and previous question papers.

Built to make exchanging useful academic resources easier within a student community.

## Features

- Student registration and login
- Browse available products
- Search and sort products
- View product details
- Add new products for sale
- Manage your own listings
- Contact sellers
- Supabase database and authentication integration

## Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js

**Database and Authentication**
- Supabase
- PostgreSQL

## Project Structure

```text
Campus-Swap/
│
├── Backend/
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   └── .gitignore
│
├── Frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── sell-item.html
│   ├── product-details.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── product-details.js
│   │   ├── sell-item.js
│   │   ├── dashboard.js
│   │   ├── header.js
│   │   └── supabase-config.js
│   │
│   └── images/
│
└── README.md
```

## Requirements

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account
- VS Code Live Server extension (recommended)

## Installation and Setup

### 1. Clone the repository

Open your terminal and run:

```bash
git clone https://github.com/aishwaryabainagari/campus-swap-student-marketplace.git
```

Move into the project directory:

```bash
cd campus-swap-student-marketplace
```

### 2. Set up the backend

Open the project in VS Code.

Navigate to the Backend folder:

```bash
cd Backend
```

Install the required dependencies:

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the Backend folder.

Add your own Supabase project credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Never share or commit secret keys, service-role keys or your `.env` file.

### 4. Configure Supabase

1. Create a Supabase project.
2. Get your project URL and publishable key.
3. Configure the `products` table and its required columns.
4. Enable Row Level Security (RLS).
5. Configure the required product access policies.
6. Configure Supabase Authentication.

The products table should support product information such as name, category, price, condition, image URL, description and seller details.

It should also include `owner_id` to associate listings with authenticated users.

### 5. Configure the frontend

Open:

```text
Frontend/js/supabase-config.js
```

Add your own Supabase project URL and publishable key using the existing configuration format.

Check that the frontend API URL points to your running backend:

```javascript
const API_URL = "http://localhost:3000/api/products";
```

### 6. Run the backend

Open a terminal in the Backend folder:

```bash
node server.js
```

The backend should run at:

```text
http://localhost:3000
```

Keep this terminal running while using the application.

### 7. Run the frontend

Open the Frontend folder in VS Code.

Right-click `index.html` and select:

**Open with Live Server**

The Campus Swap homepage should open in your browser.

## How to Use

1. Register with a student account.
2. Log in to the marketplace.
3. Browse available academic products.
4. Search for products or sort them by price.
5. Open View Details to see product information.
6. Use Sell an Item to add a listing.
7. Visit your dashboard to manage your listings.

## For Teammates and Contributors

1. Fork or clone the repository.
2. Create your own Supabase project.
3. Configure your local environment variables.
4. Install backend dependencies using `npm install`.
5. Run the backend and frontend locally.
6. Make changes and test them before submitting a pull request.

Please do not commit private credentials or personal environment files.

## Future Improvements

- Product image URL validation and preview
- Improved search and filtering
- Better mobile responsiveness
- Product categories and additional marketplace features

## Project Repository

GitHub: https://github.com/aishwaryabainagari/campus-swap-student-marketplace

## Developed By

Campus Swap – Student Marketplace

A student-focused project built to make academic resource sharing easier.
