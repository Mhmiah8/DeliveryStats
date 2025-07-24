# Project: London Delivery Stats Tracker

## Purpose
A web app designed for London-based delivery drivers (Uber Eats, Deliveroo, Just Eat, etc.) to:
- Submit how many orders they completed and hours worked
- See real-time and fallback stats on which apps are busiest
- Compare pay rates and order volumes across different timeframes and vehicle types

## Stack
- **Frontend:** React + Tailwind CSS + React Router
- **Backend:** Firebase (Firestore, Auth, Hosting)
- **Auth:** Email/password (Firebase Authentication)
- **Data Storage:** Firestore
- **Hosting:** Firebase Hosting

## Features
- Homepage: Public stats using fallback and verified user-submitted data
- Submit Page: Only logged-in users can submit reports
- Login/Signup Pages: Users create accounts via Firebase Auth
- Admin Panel: Only accessible to the creator and authorized admins for:
  - Viewing all reports with verify/delete functionality
  - Viewing aggregated stats with a simple bar chart (total orders per app)
  - Filtering reports by verification status, app name, and vehicle type
  - Toggling between reports view and a compact users list (showing users who submitted reports and their counts)
  - Managing admin users (future)
- Responsive design with clear UI for couriers
- Navbar added across all pages with links to home, submit, login/signup, admin (if authorized), about, contact, and community pages

## Data Submission
When a user submits a report:
- Store `appName`, `orders`, `vehicleType`, `hoursWorked`, `userId`, `userEmail`, `verified = false`
- Admin reviews and manually verifies via Admin Panel
- Only verified reports count in public stats (fallback data used when no verified data)

## Current To-Dos
- Add reusable Navbar across pages with conditional admin link
- Create Admin Panel with:
  - Reports table (verify, unverify, delete)
  - Bar chart summary of orders per app using Recharts (`npm install recharts`)
  - Filters for reports (verified status, app name, vehicle type)
  - Toggle button to switch to users list (showing emails and report counts)
- Improve fallback data realism with weighted distribution by hour
- Add About, Contact, Community pages (empty shells for now)
- Optional: Add Docker support for local development and recruiter demos

## Admin Email
Only `mmiahhilal1@gmail.com` is admin by default. Admin emails stored in Firestore collection `adminUsers`. Authorization is checked in navbar and admin page access.

## Navigation Plan
- `/` → Homepage (public)
- `/login` → Login form
- `/signup` → Signup form
- `/submit` → Submit report (requires login)
- `/admin` → Admin-only page with reports and management
- `/about`, `/contact`, `/community` → Static/info pages

## Deployment
Firebase Hosting. Docker optional for local developer/recruiter usage.

## Goal
Accessible, recruiter-friendly, simple, and performant with minimal backend cost.
