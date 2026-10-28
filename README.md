# Learning Management System (LMS) API

## Project Overview

The Learning Management System (LMS) API is a backend application built with Django and Django REST Framework. It provides a platform for managing courses, lessons, student enrollments, and quizzes.

The system supports different user roles, including students, instructors, and administrators. Students can enroll in courses, access lessons, track their learning progress, and take quizzes. Instructors can manage their courses, create lessons, add quiz questions, and view student quiz results.

## Features

- User authentication and role-based access control.
- Course creation, listing, updating, and management.
- Lesson creation and retrieval.
- Student enrollment in courses.
- Lesson progress tracking and completion.
- Quiz creation and publication.
- Multiple-choice questions with four answer options.
- Quiz submission and automatic grading.
- Quiz scores and pass/fail results.
- API documentation using Swagger and ReDoc.

## Technologies Used

- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT (if configured)
- drf-spectacular for API documentation
- SQLite or the configured project database
- Postman for API testing
- Git and GitHub for version control

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

Replace the placeholders with your actual repository URL and project folder name.

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

If a `requirements.txt` file exists:

```bash
pip install -r requirements.txt
```

Otherwise, install the packages required by your project, for example:

```bash
pip install django djangorestframework drf-spectacular
```

Install any additional packages your project uses, including JWT authentication packages if configured.

### 4. Apply Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create an Administrator

```bash
python manage.py createsuperuser
```

Follow the prompts to create the administrator account.

### 6. Start the Development Server

```bash
python manage.py runserver
```

The API will be available at:

`http://127.0.0.1:8000/`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET, POST | `/api/courses/` | List and create courses |
| GET, PUT, PATCH, DELETE | `/api/courses/{id}/` | Retrieve or manage a course |
| GET, POST | `/api/courses/lessons/` | List and create lessons |
| GET, PUT, PATCH, DELETE | `/api/courses/lessons/{id}/` | Retrieve or manage a lesson |
| GET, POST | `/api/enrollments/` | List enrollments and create an enrollment |
| GET, POST | `/api/enrollments/progress/` | List and create lesson progress records |
| GET, PATCH | `/api/enrollments/progress/{id}/` | Retrieve or update lesson progress |
| GET, POST | `/api/assessments/quizzes/` | List and create quizzes |
| GET, PUT, PATCH, DELETE | `/api/assessments/quizzes/{id}/` | Retrieve or manage a quiz |
| GET, POST | `/api/assessments/quizzes/{quiz_id}/questions/` | List or create quiz questions |
| GET, POST | `/api/assessments/attempts/` | View quiz attempts or start an attempt |
| POST | `/api/assessments/attempts/{attempt_id}/submit/` | Submit quiz answers |
| GET | `/api/schema/` | Access the OpenAPI schema |
| GET | `/api/docs/` | Open Swagger API documentation |
| GET | `/api/redoc/` | Open ReDoc API documentation |

Authentication endpoints are available under `/api/auth/`. Consult `accounts/urls.py` for the exact login, registration, or token endpoints configured in your project.

**Note:** Available methods and permissions depend on the view configuration. For example, students should only access their own quiz attempts, while instructors should access results for their own courses.

## Authentication

For protected endpoints:

1. Authenticate using the configured authentication endpoint.
2. Obtain an access token if JWT authentication is enabled.
3. In Postman, open the **Authorization** tab.
4. Select **Bearer Token** and enter the access token.
5. Send the request.

Never commit passwords, access tokens, or secret keys to the repository.

## Example: Create a Quiz

**Endpoint:** `POST /api/assessments/quizzes/`

Example JSON body:

```json
{
  "course": 10,
  "title": "Cybersecurity Fundamentals Quiz",
  "description": "Test your understanding of cybersecurity fundamentals.",
  "passing_score": 50,
  "is_published": true
}
```

The course ID must refer to a valid course, and the authenticated instructor must have permission to create quizzes for that course.

## Example: Create a Multiple-Choice Question

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

The correct answer must be one of `A`, `B`, `C`, or `D`.

## Example: Start a Quiz Attempt

**Endpoint:** `POST /api/assessments/attempts/`

```json
{
  "quiz": 7
}
```

The student must be authenticated, the quiz must be published, and the student must be enrolled in the course.

## Example: Submit Quiz Answers

**Endpoint:** `POST /api/assessments/attempts/2/submit/`

```json
{
  "answers": [
    {
      "question": 8,
      "selected_answer": "B"
    },
    {
      "question": 9,
      "selected_answer": "B"
    }
  ]
}
```

The API checks the submitted answers, calculates the score, determines whether the student passed, and saves the result.

## Testing

The API can be tested using Postman or Swagger.

Recommended test scenarios:

- Register and authenticate users.
- Verify access permissions for students and instructors.
- Create and retrieve courses and lessons.
- Enroll a student in a course.
- Create and update lesson progress.
- Create a quiz and add questions.
- Start a quiz attempt and submit answers.
- Verify quiz scores and pass/fail status.
- Confirm that instructors can view results for their own courses.
- Confirm that students cannot access other students' results.

## API Documentation

After starting the development server, visit:

- **Swagger UI:** `http://127.0.0.1:8000/api/docs/`
- **ReDoc:** `http://127.0.0.1:8000/api/redoc/`

These pages provide interactive documentation for the available API endpoints.

## Future Improvements

- Add pagination, filtering, and search.
- Add richer reporting and student performance analytics.
- Improve quiz and enrollment management.
- Add automated unit and integration tests.
- Deploy the application to a production server.
- Configure production database settings and secure environment variables.

## Author

Developed as a Learning Management System API project.
