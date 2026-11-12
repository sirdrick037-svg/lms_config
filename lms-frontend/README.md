
# SkillNest – Learning Management System

## Project Overview

SkillNest is a web-based Learning Management System (LMS) built with React and Vite. It provides an interactive platform where students can access courses, complete lessons, track their learning progress, and take quizzes.

The application connects to a backend API built with Django REST Framework.

SkillNest supports different user roles, including students, instructors, and administrators, providing functionality for managing courses, learning activities, and assessments.

## Features

- User registration and authentication.
- Role-based access for students, instructors, and administrators.
- Course browsing and course details.
- Student course enrollment.
- Lesson access and learning progress tracking.
- Quiz participation and submission.
- Automatic quiz scoring.
- Student selection of an assigned instructor to review quiz submissions.
- Instructor approval or rejection of quiz submissions.
- Student dashboard displaying quiz results and review status.
- Payment integration with an M-Pesa demo mode.

## Technologies Used

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Axios for API communication
- React Router DOM for navigation
- Django REST Framework (backend API)

## Project Structure

```text
lms-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the frontend folder:

```bash
cd YOUR_PROJECT_FOLDER/lms-frontend
```

Replace the repository URL and folder name with your actual details.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will normally be available at:

http://localhost:5173/

## Backend Integration

SkillNest communicates with a Django REST Framework backend.

The API base URL is configured in:

`src/services/api.js`

The current development backend URL is:

http://127.0.0.1:8000/api/

Before using the frontend, make sure the Django backend is running.

## Running the Application

For local development:

1. Start the Django backend.
2. Start the React frontend.
3. Open http://localhost:5173/ in your browser.
4. Register or log in using an appropriate account.
5. Explore the available features based on your user role.

## API Documentation

The backend provides interactive API documentation through:

- Swagger UI: http://127.0.0.1:8000/api/docs/
- ReDoc: http://127.0.0.1:8000/api/redoc/

## Payment Integration

SkillNest includes M-Pesa payment integration.

A demo mode is available for testing payment-related functionality without initiating a real M-Pesa transaction.

Real payment processing requires the appropriate M-Pesa credentials and production configuration on the backend.

## Development

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Future Improvements

- Improve responsive design for mobile devices.
- Add notifications and messaging.
- Enhance student performance analytics.
- Improve search and course filtering.
- Add more automated frontend tests.
- Deploy the application for production use.

## Author

Developed as part of the SkillNest Learning Management System project.
