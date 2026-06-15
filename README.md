# Shree Renukamba Communication - Mobile Repair & Electronics Commerce Platform

![Shree Renukamba Logo](https://img.shields.io/badge/Shree_Renukamba-Premium_Repair_Hub-4F46E5?style=for-the-badge)
![PERN Stack](https://img.shields.io/badge/Stack-PERN-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge)

Shree Renukamba Communication is a complete production-ready PERN Stack (PostgreSQL, Express, React, Node.js) application designed as a professional business management platform for mobile repair shops, refurbished phone sales, accessories sales, inventory management, and e-commerce.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Workflows](#system-workflows)
5. [Database Architecture](#database-architecture)
6. [Folder Structure](#folder-structure)
7. [API Documentation](#api-documentation)
8. [Installation & Setup](#installation--setup)
9. [Scripts](#scripts)

---

## 🔍 Project Overview

The Shree Renukamba Communication platform bridges the gap between traditional brick-and-mortar device repair shops and modern e-commerce. It features a dual-interface system:
- **Customer Portal**: A premium, glassmorphism-styled storefront for booking repairs, tracking device status, and purchasing refurbished electronics.
- **Admin Portal (Lumina)**: A comprehensive dashboard for technicians and owners to manage active repair tickets, inventory levels, order fulfillment, and business analytics.

---

## ✨ Key Features

### 👥 User Roles
- **Admin**: Full access to customer management, active repairs queue, inventory alerts, and financial reporting.
- **Customer**: Can book repairs, track timeline progress, shop for refurbished devices, and view order history.

### 🛠️ Repair Management Module
- **Multi-step Booking Flow**: Clean, horizontal stepper for device selection, issue description, and detail submission.
- **Live Tracking Timeline**: Vertical timeline showing the exact status of a device (e.g., Device Received, Diagnostic Complete, Repair in Progress, Ready for Pickup).
- **Admin Queue**: Centralized table to view all incoming tickets, approve repair costs, and update statuses.

### 🛒 E-Commerce & Inventory
- **Product Store**: Browsable store with filters for Categories, Condition (Excellent, Like New, Good), and Price Range.
- **Shopping Cart**: Standard checkout flow with Redux state management.
- **Inventory Alerts**: Admin dashboard shows real-time warnings for low-stock parts (e.g., iPhone batteries, screens).

### 🔐 Security & Auth
- JWT Authentication with HTTP-only cookies (prepared).
- Password hashing via `bcryptjs`.
- Express security middlewares (`helmet`, `xss-clean`, `express-rate-limit`).

---

## 💻 Technology Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS v4, Vanilla CSS (Glassmorphism & Shadows)
- **State Management**: Redux Toolkit (Auth/Cart state), React Query (Server state)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Image Uploads**: Cloudinary + Multer
- **Emails**: Resend / Nodemailer
- **Payments**: Razorpay

---

## 🔄 System Workflows

### 1. Repair Booking Workflow
1. **Customer** logs in and navigates to the "Book a Repair" page.
2. Selects device type (iPhone, MacBook, etc.) using the visual grid.
3. Submits specific model details and issue description.
4. **Backend** generates a unique Ticket ID (e.g., `#REP-8492`) and sets status to *Pending Diagnosis*.
5. **Admin** sees the ticket in the "Active Repairs Queue", reviews the physical device, and sets an estimated cost.
6. **Customer** tracks the progress via the vertical timeline on their Dashboard.

### 2. E-Commerce Workflow
1. **Customer** browses the `/shop` route and uses the left sidebar to filter refurbished devices by condition or category.
2. Items are added to the Redux-managed shopping cart.
3. Customer proceeds to Checkout, triggering the Razorpay payment gateway integration.
4. Upon success, **Backend** generates an Order document, reduces Inventory stock counts, and triggers an email receipt via Resend.

---

## 🗄️ Database Architecture

The backend utilizes PostgreSQL with the following models:
- **`User`**: Base authentication model (Admin, Customer, Technician roles).
- **`Customer`**: Extended profile details, address book, loyalty points.
- **`Device`**: Registered devices belonging to a customer.
- **`RepairOrder`**: Core tracking model (links Customer, Device, Technician, Status Timeline, Cost).
- **`Product`**: E-commerce items (SKU, price, specs, variants).
- **`Category`**: Organizational tags for products.
- **`Order`**: E-commerce purchase history.
- **`Inventory`**: Tracking for spare parts and raw materials used in repairs.

---

## 📂 Folder Structure

```text
electrofix/
├── run.bat                 # One-click startup script
├── backend/                # Node.js / Express Server
│   ├── config/             # DB & Service configurations
│   ├── controllers/        # Route logic handlers
│   ├── middleware/         # Auth & Error handling
│   ├── models/             # Database schemas
│   ├── routes/             # Express API endpoints
│   ├── services/           # Cloudinary, Resend, Razorpay logic
│   └── index.js            # Server entry point
│
└── frontend/               # Vite / React Application
    ├── public/             
    ├── src/                
    │   ├── components/     # Reusable UI (Navbar, etc.)
    │   ├── layouts/        # PublicLayout, DashboardLayout
    │   ├── pages/          
    │   │   ├── admin/      # AdminDashboard
    │   │   ├── customer/   # Customer Dashboard, BookRepair
    │   │   ├── ecommerce/  # Products, Cart
    │   │   └── Login, LandingPage, Register
    │   ├── redux/          # Redux Store & Slices
    │   ├── index.css       # Tailwind entry & custom utilities
    │   ├── main.jsx        # App entry & Context Providers
    │   └── App.jsx         # React Router configurations
    ├── tailwind.config.js  # Custom Theme
    └── postcss.config.js   # Tailwind v4 PostCSS Config
```

---

## 🌐 API Documentation

The RESTful API is structured under the `/api/v1/` prefix:

* **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
* **Products**: `/api/products` (GET, POST, PUT, DELETE)
* **Categories**: `/api/categories`
* **Repairs**: `/api/repairs` (Book new repair, update status timeline, approve cost)
* **Orders**: `/api/orders` (Process checkout, verify payment)
* **Inventory**: `/api/inventory` (Track stock, low stock alerts)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database URL
- API Keys for Cloudinary, Razorpay, and Resend.

### 1. Environment Variables
You will need to create a `.env` file inside the `backend` directory:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

RESEND_API_KEY=your_resend_key
```

### 2. Startup
To instantly run both the Backend and Frontend concurrently, simply double-click the included batch file from the root directory:

**Windows:**
```cmd
.\run.bat
```

This script will automatically:
1. Open a terminal and start the Express server on `http://localhost:5000`.
2. Open a second terminal, start the Vite development server on `http://localhost:5173`, and launch your default browser.

---

## 🎨 UI / UX Design Specifications
The frontend has been completely refactored to match a premium SaaS design requested by the client:
- **Colors**: Primary Indigo (`#4F46E5`), Slate Grays (`#64748B`), and subtle cool backgrounds (`#F6F8FD`).
- **Cards**: Minimal borders (`border-border`), rounded corners (`rounded-3xl`), and soft glassmorphism shadows (`shadow-sm`, `shadow-soft`).
- **Icons**: Consistent stroke weights provided by `lucide-react`.

---
*Developed as a complete PERN stack architecture for modern mobile repair and electronic commerce.*
