# DevCheck – Smart Task Manager for Developers & Designers

## Overview

**DevCheck** is a productivity web app built for **developers and designers** to help them create, manage, and track project checklists efficiently.
It enables users to organize their work into **tasks and subtasks**, set **deadlines**, receive **notifications**, and stay on schedule — all through a clean and intuitive interface.

Users can **manually create checklists** or **upload JSON files** to generate them automatically. Each task can include multiple subtasks, attachments, and deadlines that are intelligently managed to ensure nothing slips past.

---

## ⚙️ Core Functionalities

### **Task Management**

- Create, edit, delete, and view tasks.
- Add descriptions, due dates, and priority levels (Low / Medium / High).
- Each task can have multiple **subtasks** with independent tracking.
- Subtask deadlines cannot exceed the parent task’s deadline.
- Track overall task progress as a percentage.

### **JSON Import & Export**

- Import tasks and subtasks via `.json` file uploads.
- Export full checklist data as `.json` for backup or sharing.

### **Notifications & Reminders**

- Get notified when a task or subtask deadline is near.
- Uses background jobs and Redis to schedule notifications.
- Supports both **in-app** and **email** reminders.

### **User Authentication & Session Management**

- Secure registration and login with **bcrypt password hashing**.
- **OTP-based email verification** during registration.
- Session data stored in **Redis** for performance and scalability.
- Token-based authentication for secure API access.

### **Redis Caching**

- Caches frequently accessed data like user sessions and deadlines.
- Reduces PostgreSQL query load during high traffic periods.
- Includes session expiry and rate limiting for security.

### 📎 **Attachments**

- Upload and attach files (designs, documents, etc.) to tasks or subtasks.
- Files are stored securely, with references saved in the database.

### **Analytics & Progress Tracking**

- View percentage completion per task and subtask.
- Dashboard insights for total tasks, completed items, and overdue work.

---

## **System Architecture**

### **Frontend**

- **React.js (Vite)** for responsive and dynamic user interfaces.
- Reusable components for tasks, subtasks, and notification cards.
- REST API integration with Axios for fast data fetching.

### **Backend**

- **Node.js (Express)** as REST API server.
- **PostgreSQL** for relational data storage.
- **Redis** for caching sessions, OTPs, and notification jobs.
- ✉️ **Nodemailer** (or similar) for email notifications and verification.

---

## **Database Schema (Simplified)**

| Table             | Description                                               |
| ----------------- | --------------------------------------------------------- |
| **User**          | Stores user credentials and profile info                  |
| **Tasks**         | Holds main task data (title, description, due date, etc.) |
| **SubTasks**      | Linked to tasks for milestone tracking                    |
| **Notifications** | Stores alert data and scheduling info                     |
| **Attachments**   | Keeps file URLs and metadata linked to tasks/subtasks     |

---

## **System Flow**

### **Login Flow**

1. User submits login credentials.
2. App checks Redis cache → if not found, queries PostgreSQL.
3. Credentials validated → JWT token generated.
4. Token and session stored in Redis.
5. Response returned to client.

### **Registration Flow**

1. User submits registration details.
2. System checks if email exists in DB.
3. If not, creates temporary user + generates OTP.
4. Stores OTP in Redis with 10-minute TTL.
5. Sends verification email with OTP.
6. Once verified → user added to DB → session created in Redis.

---

## **Future Enhancements**

- Team collaboration boards.
- Calendar view with drag-and-drop scheduling.
- Integrations (GitHub, Figma, Jira).
- Push notifications (web & mobile).
- AI assistant for smart prioritization and deadline suggestions.

---

## **Tech Stack**

- **Frontend:** React.js, TailwindCSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Caching & Queue:** Redis
- **Email Service:** Nodemailer / Resend / Mailgun
- **Authentication:** JWT + Redis session caching

---

## **Project Goals**

- Simplify task management for developers and designers.
- Provide real-time feedback and reminders before deadlines.
- Improve system scalability with Redis caching.
- Create a clean, distraction-free productivity platform.
