# SkillNest – Learning Management System API

## Project Overview

SkillNest is a Learning Management System (LMS) backend built with Python, Django, and Django REST Framework.

It provides RESTful APIs for managing users, courses, lessons, student enrollments, learning progress, quizzes, assessments, and payments.

The system supports three main user roles:

- **Students:** Browse courses, enroll, access lessons, track progress, and take quizzes.
- **Instructors:** Manage assigned courses, create lessons and quizzes, and review student quiz submissions.
- **Administrators:** Manage the platform and oversee its activities.

The backend communicates with the SkillNest React frontend.

## Features

### Authentication and User Management
- User registration and authentication.
- Role-based access control.
- Student, instructor, and administrator roles.

### Course Management
- Create, retrieve, update, and manage courses.
- Assign multiple instructors to a course.
- Retrieve course instructor information.
- Manage course publication status.

### Lesson Management
- Create and manage course lessons.
- Retrieve lessons belonging to courses.
- Track student lesson completion.

### Enrollment and Learning Progress
- Student course enrollment.
- Enrollment management.
- Lesson progress tracking.
- Completion status management.

### Quiz and Assessment Management
- Create and publish quizzes.
- Add multiple-choice questions with four answer options.
- Start quiz attempts.
- Submit quiz answers.
- Automatic quiz grading and score calculation.
- Track quiz attempts and results.

### Instructor Quiz Review
- Students select an instructor assigned to the course before submitting a quiz.
- Quiz submissions are assigned to the selected instructor.
- Only the selected instructor or an administrator can review the submission.
- Instructors can approve or reject quiz submissions.
- Review status, reviewer information, and review timestamps are recorded.
- Students can view their quiz review status and final results.

### Payment Integration
- M-Pesa payment integration.
- Demo mode for testing payment functionality without initiating a real transaction.
- Payment-related functionality connected to student enrollment.

## Technologies Used

- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT (if configured)
- drf-spectacular
- SQLite or the configured database
- Postman for API testing
- Git and GitHub

## Project Structure

```text
lms_project/
├── manage.py
├── lms_config/
│   ├── settings.py
│   └── urls.py
├── accounts/
├── courses/
├── enrollments/
├── assessments/
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Replace the placeholders with your actual repository URL and project folder.

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On macOS or Linux:

```bash
source venv/bin/activate
```

### 3. Install Dependencies

If your project contains a requirements.txt file:

```bash
pip install -r requirements.txt
```

Otherwise, install the required packages used by your project.

### 4. Configure Environment Variables

Create a `.env` file if your project uses environment variables.

Configure the required Django settings, database credentials, secret key, and payment settings.

Do not commit your `.env` file or expose sensitive credentials in the repository.

### 5. Apply Database Migrations

```bash
python manage.py migrate
```

If you have made model changes that require new migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create an Administrator

```bash
python manage.py createsuperuser
```

Follow the prompts to create an administrator account.

### 7. Start the Development Server

```bash
python manage.py runserver
```

The backend API will be available at:

http://127.0.0.1:8000/

## API Endpoints

The main API routes include:

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | `/api/courses/` | List and create courses |
| GET, PUT, PATCH, DELETE | `/api/courses/{id}/` | Retrieve or manage a course |
| GET, POST | `/api/courses/lessons/` | List and create lessons |
| GET, POST | `/api/enrollments/` | Manage student enrollments |
| GET, POST | `/api/enrollments/progress/` | Manage lesson progress |
| GET, POST | `/api/assessments/quizzes/` | List and create quizzes |
| GET, POST | `/api/assessments/attempts/` | View attempts or start a quiz |
| POST | `/api/assessments/attempts/{attempt_id}/submit/` | Submit quiz answers |
| GET | `/api/schema/` | OpenAPI schema |
| GET | `/api/docs/` | Swagger documentation |
| GET | `/api/redoc/` | ReDoc documentation |

Authentication endpoints are available under `/api/auth/`.

Additional assessment review and payment endpoints are available according to the configured URL routes.

Available HTTP methods and permissions depend on the individual views.

## Quiz Submission and Review Workflow

SkillNest supports an instructor-based quiz review process.

1. A student starts a published quiz.
2. The student answers the quiz questions.
3. Before submission, the student selects an instructor assigned to the course.
4. The backend validates the selected instructor.
5. The quiz is submitted and automatically graded.
6. The submission receives a pending review status.
7. The selected instructor reviews the submission and approves or rejects it.
8. The student can view the review status and reviewer information on the dashboard.

## Example API Requests

### Create a Quiz

**Endpoint:** `POST /api/assessments/quizzes/`

```json
{
  "course": 10,
  "title": "Cybersecurity Fundamentals Quiz",
  "description": "Test your understanding of cybersecurity fundamentals.",
  "passing_score": 50,
  "is_published": true
}
```

The course ID must refer to a valid course, and the authenticated user must have permission to create quizzes for that course.

### Create a Multiple-Choice Question

**Endpoint:** `POST /api/assessments/quizzes/7/questions/`

```json
{
  "text": "What is the main purpose of a firewall?",
  "option_a": "To edit documents",
  "option_b": "To filter network traffic",
  "option_c": "To play media",
  "option_d": "To create passwords",
  "correct_answer": "B"
}
```

### Start a Quiz Attempt

**Endpoint:** `POST /api/assessments/attempts/`

```json
{
  "quiz": 7
}
```

The student must meet the applicable quiz access requirements.

### Submit Quiz Answers

**Endpoint:** `POST /api/assessments/attempts/2/submit/`

```json
{
  "selected_reviewer": 3,
  "answers": [
    {
      "question": 8,
      "selected_answer": "B"
    },
    {
      "question": 9,
      "selected_answer": "A"
    }
  ]
}
```

The selected reviewer must be an instructor assigned to the quiz's course.

The backend validates the answers, calculates the score, and saves the submission for instructor review.

## Authentication

Protected API endpoints require authentication.

If JWT authentication is enabled:

1. Authenticate through the configured login endpoint.
2. Obtain an access token.
3. Open the Authorization tab in Postman.
4. Select Bearer Token.
5. Enter the access token.
6. Send the request.

Never commit passwords, access tokens, or secret keys to GitHub.

## API Documentation

Start the Django development server and visit:

- **Swagger UI:** http://127.0.0.1:8000/api/docs/
- **ReDoc:** http://127.0.0.1:8000/api/redoc/

These interfaces provide interactive documentation for the available API endpoints.

## Testing

The API can be tested using Postman and Swagger.

Recommended test scenarios:

- Register and authenticate users.
- Verify role-based permissions.
- Create and manage courses.
- Assign multiple instructors to courses.
- Enroll students in courses.
- Track lesson completion.
- Create quizzes and questions.
- Submit quiz answers.
- Verify automatic grading.
- Verify instructor selection during submission.
- Confirm that only the selected instructor or an administrator can review a submission.
- Verify quiz approval and rejection.
- Confirm that students can view their review results.
- Test payment functionality using the configured demo mode.

## Future Improvements

- Add pagination, filtering, and search.
- Improve student performance analytics.
- Expand automated unit and integration tests.
- Improve payment transaction handling.
- Add notifications for quiz reviews and payments.
- Deploy the API to a production environment.
- Configure production database and security settings.

## Author

Developed as part of the SkillNest Learning Management System project.
