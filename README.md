# LMS Cloud Frontend Application

## 👤 Student Metadata

* **Student Name:** M. Chamindu Chirantha
* **Student ID:** [241711027]
* **GCP Project ID:** [project-5cb0d26c-1f1d-4c90-862]
* **Frontend Url:**(http://35.247.135.247/)

---

## 📝 Project Description

The **LMS Cloud Frontend** is a modern web application built using Next.js App Router for the Library Management System. It provides intuitive dashboards and interfaces for both Librarians and standard Users, enabling real-time book borrowing, user management, and seamless microservice interaction through the cloud gateway.

---

## ⚡ Technology Stack

* **Framework:** Next.js (App Router)
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4, PostCSS
* **Linting & Code Quality:** ESLint

---

## 📁 Project Structure

```text
cloud-frontend/
├── public/                 # Static assets
├── src/
│   └── app/                # Next.js App Router Directory
│       ├── dashboard/      # Role-based Dashboard routes
│       │   ├── librarian/  # Librarian control panel view (`page.tsx`)
│       │   └── user/       # Member dashboard view (`page.tsx`)
│       ├── login/          # User authentication page (`page.tsx`)
│       ├── register/       # User registration page (`page.tsx`)
│       ├── globals.css     # Global styles & Tailwind directives
│       ├── layout.tsx      # Root layout wrapper
│       └── page.tsx        # Home / Landing page
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration for Tailwind
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts registry
