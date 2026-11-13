
# Sweety – Blood Glucose Tracker

Sweety is a full-stack web application that helps users record, manage, and monitor their daily blood glucose readings.

## Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
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
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── seed.js
│   └── index.js
├── screenshots/
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Monika195-tech/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Database Setup

1. Install PostgreSQL.
2. Create a database named `sweety_db`.
3. Create the following tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE glucose_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    slot VARCHAR(50) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, reading_date, slot)
);
```

### 3. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` and configure your PostgreSQL credentials and JWT secret.

Required environment variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secret_key
```

### 4. Seed Demo Data

Run the following command inside the server folder:

```bash
npm run seed
```

This creates a demo account and sample glucose readings.

**Demo Login:**

- Email: demo@sweety.com
- Password: SweetyDemo123!

Note: Running the seed command again replaces the existing readings belonging to the demo account.

### 5. Start the Backend

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 6. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file using `.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Validation Rules

- Glucose values must be integers between 40 and 600 mg/dL.
- All required fields must be provided.
- Future dates are not allowed.
- Only one reading per slot per day is allowed for each user.
- A maximum of four readings per day is supported.
- Users can access only their own readings.

## Screenshots

Application screenshots are available in the `screenshots` folder.

## Testing

The application was manually tested for:

- User registration and login
- Adding glucose readings
- Editing and deleting readings
- Reading validation
- Duplicate-reading prevention
- Daily and monthly reports
- Demo account login

## Notes

Sweety is intended for glucose tracking and record management. It does not provide medical diagnosis or replace professional medical advice.
