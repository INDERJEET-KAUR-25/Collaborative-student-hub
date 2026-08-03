# 🚀 Collaborative Student Hub

A full-stack web application that connects university students looking to collaborate on academic, research, and personal projects. The platform enables students to showcase their skills, discover projects, apply to join teams, manage tasks, and receive notifications through a secure and scalable web application.

---

## 📌 Overview

Collaborative Student Hub addresses the common challenge students face in finding compatible teammates for projects. Instead of relying on messaging groups or personal contacts, students can publish project ideas, browse existing projects, apply to join teams, and collaborate through a centralized platform.

The project follows a modular architecture using **Django REST Framework** for the backend and **React + Vite** for the frontend.

---

# ✨ Features

### 👤 User Management

* User registration and authentication
* Student profile management
* Skill-based profiles
* Secure REST APIs

### 📁 Project Management

* Create new projects
* Edit and delete projects
* Browse available projects
* View project details

### 🤝 Project Applications

* Apply to join projects
* Accept or reject applications
* Track application status

### ✅ Task Management

* Create project tasks
* Assign tasks
* Track progress
* Organize team work

### 🔔 Notifications

* Receive application updates
* Project activity notifications
* Team communication alerts

### 🎨 Responsive Frontend

* Modern React interface
* Fast Vite development environment
* Responsive layout
* Clean user experience

---

# 🏗️ Tech Stack

## Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3

## Backend

* Django
* Django REST Framework (DRF)

## Database

* SQLite (Default Django Database)

## Tools & Version Control

* Git
* GitHub

---

# 📂 Project Structure

```text
Collaborative-student-hub/
│
├── Collaborative_student_hub/        # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── accounts/                         # Authentication & user profiles
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── projects/                         # Project management
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── applications/                     # Project applications
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── tasks/                            # Task management
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── notifications/                    # Notifications
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── manage.py
├── requirements.txt
├── run_server.bat
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/INDERJEET-KAUR-25/Collaborative-student-hub.git
```

## 2. Navigate to the project

```bash
cd Collaborative-student-hub
```

## 3. Create a virtual environment

```bash
python -m venv venv
```

## 4. Activate the environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

## 5. Install backend dependencies

```bash
pip install -r requirements.txt
```

## 6. Apply database migrations

```bash
python manage.py migrate
```

## 7. Start the Django server

```bash
python manage.py runserver
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# 📡 Backend Modules

| Module            | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| **accounts**      | Handles user registration, authentication, and profile management.   |
| **projects**      | Manages project creation, updates, listings, and details.            |
| **applications**  | Allows students to apply for projects and manage application status. |
| **tasks**         | Supports task creation, assignment, and progress tracking.           |
| **notifications** | Sends project and application-related notifications.                 |

---

# 🔄 Workflow

1. User registers and logs in.
2. Student creates or browses projects.
3. Interested users apply to join projects.
4. Project owner reviews applications.
5. Accepted members collaborate on assigned tasks.
6. Notifications keep users informed of important updates.

---

# 📈 Future Enhancements

* JWT Authentication
* Real-time chat
* Email notifications
* AI-powered teammate recommendations
* Project recommendation engine
* File sharing
* Calendar integration
* Team discussion boards
* Project analytics dashboard

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.

---

# 📄 License

This project is intended for educational and academic purposes.

---

# 👨‍💻 Authors

Developed by the **Collaborative Student Hub Team** as a full-stack university project using Django REST Framework and React.
Team members: https://github.com/INDERJEET-KAUR-25
              https://github.com/Abel-2005
              https://github.com/guleria005

---

# Live Deployed Link
http://16.16.106.20

