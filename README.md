# Sweety – Blood Glucose Tracker

Sweety is a full-stack web application that helps users record, manage, and monitor their daily blood glucose readings.

## Features

- User registration and login
- Secure password hashing and JWT authentication
- Add, view, edit, and delete glucose readings
- Four reading slots: Morning fasting, After breakfast, After lunch, and After dinner
- Daily glucose reports
- Month-to-date reports
- Previous-month reports
- Highest, lowest, and average reading statistics
- Input validation and duplicate-reading prevention
- User-specific reading history

## Technologies Used

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: JWT and bcrypt
- API Testing: Postman

## Project Structure

```text
sweety/
├── client/
├── server/
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sweety
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using the provided `.env.example` and configure your database credentials and JWT secret.

### 3. Database Setup

Create a PostgreSQL database named `sweety_db`.

Run the database schema or setup script provided in the server folder.

### 4. Start Backend

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 5. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file with:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Validation Rules

- Glucose values must be between 40 and 600 mg/dL.
- Only integer values are accepted.
- Future dates are not allowed.
- Duplicate readings for the same user, date, and slot are prevented.
- Users can access only their own readings.

## Notes

Sweety is intended for glucose tracking and record management. It does not provide medical diagnosis or replace professional medical advice.