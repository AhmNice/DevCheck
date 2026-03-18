

# DevCheck API Documentation

**Version:** `0.0.0`
**Base URL:**

```
http://localhost:5000/api
```

**Authentication:** Session-based (via cookies)

---

## Table of Contents

1. Authentication Endpoints
2. Project Endpoints
3. Task Endpoints
4. GitHub Integration
5. Health Check
6. Webhooks
7. Error Handling

---

# Authentication Endpoints

---

## 1. User Registration

**POST** `/auth/user/register`

Register a new user with email verification via OTP.

### Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "account_role": "user"
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { ... }
}
```

### Error Response (400)

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Notes

* Rate limit: 10 requests per 60 seconds
* Email must be unique

---

## 2. Verify OTP

**POST** `/auth/user/account-verify?purpose=verification`

Verify user email or reset password.

### Request Body

```json
{
  "email": "string",
  "otp": "123456"
}
```

### Success Response

```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid OTP or expired"
}
```

---

## 3. User Login

**POST** `/auth/user/login`

### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

### Success Response

```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "_id": ".....",
        "google_id": null,
        "github_id": null,
        "name": "Muhammed Awwal",
        "email": "awwal@example.com",
        "bio": null,
        "profile_picture": "",
        "account_role": "user",
        "is_verified": false,
        "role": null,
        "created_at": "2026-03-02T11:28:50.595Z",
        "updated_at": "2026-03-02T11:28:50.595Z",
        "failed_attempts": 0,
        "lock_until": null,
        "is_suspended": false,
        "github_access_token": null,
        "github_avatar_url": null,
        "github_username": null,
        "github_profile_url": null,
        "github_connected": false,
        "github_connected_at": null,
        "sync_personal_repos": false
    }
}
```

### Notes

* Rate limit: 5 requests per 5 seconds
* Account may be locked after repeated failures

---

## 4. OAuth Authentication

### Google

* `GET /auth/google-auth`
* `GET /auth/google/callback`

### GitHub

* `GET /auth/github-auth`
* `GET /auth/github/callback`

On success:

* Session cookie is set
* Redirects to client application

---

## 5. Connect GitHub Account

**GET** `/auth/connect/github`

Connect a GitHub account to an existing user.

---

## 6. Password Reset

### Request Reset

**POST** `/auth/request-password-reset`

```json
{
  "email": "string"
}
```

### Reset Password

**POST** `/auth/reset-password?token=...`

```json
{
  "newPassword": "string"
}
```

---

# Project Endpoints

---

## 1. Create Project

**POST** `/project/create`

```json
{
  "user_id": "string",
  "name": "string",
  "description": "string",
  "deadline": "ISO 8601 DateTime"
}
```

---

## 2. Get Project

**GET** `/project/get/:project_id`

---

## 3. Get User Projects

**GET** `/project/user/:user_id`

---

## 4. Import Projects

**POST** `/project/import`

Upload a JSON file containing project data.

---

## 5. Project Actions

| Action      | Method | Endpoint                         |
| ----------- | ------ | -------------------------------- |
| Archive     | POST   | `/project/archive/:project_id`   |
| Unarchive   | POST   | `/project/unarchive/:project_id` |
| Soft Delete | PUT    | `/project/delete/:project_id`    |
| Restore     | POST   | `/project/restore/:project_id`   |
| Hard Delete | DELETE | `/project/destroy/:project_id`   |

---

## 6. Project Lists

* Archived: `GET /project/archives/:user_id`
* Deleted: `GET /project/deleted/:user_id`

---

# Task Endpoints

---

## 1. Create Task

**POST** `/task/create`

```json
{
  "user_id": "string",
  "title": "string",
  "due_date": "ISO 8601 DateTime",
  "status": "pending",
  "priority": "high"
}
```

---

## 2. Subtasks

### Create Subtask

**POST** `/task/:task_id/subtasks`

### Delete Subtask

**DELETE** `/task/delete/subtask/:subtask_id`

---

## 3. Get Task

**GET** `/task/get/:task_id`

---

## 4. Get User Tasks

**GET** `/task/user/:user_id`

---

## 5. Update Task

**PUT** `/task/update/:task_id`

---

## 6. Delete Task

**DELETE** `/task/delete/:task_id`

---

## 7. Import Tasks

**POST** `/task/import`

---

# GitHub Integration

---

## 1. Get Repositories

**GET** `/github/repos`

### Headers

```
Authorization: Bearer <github_access_token>
```

---

## 2. Search Repositories

**GET** `/github/repo/search?q=...`

---

## 3. Connect Repository

**POST** `/github/repo/connect`

```json
{
  "repoFullName": "owner/repo"
}
```

---

# Health Check

---

## Endpoint

**GET** `/health-check`

### Response

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

# Webhooks

---

## GitHub Issues Webhook

**POST** `/webhooks/github`

### Headers

```
X-GitHub-Event: issues
X-Hub-Signature-256: sha256=...
```

### Behavior

* `opened` → creates a task
* `closed` → marks task as completed
* other events → ignored

---

# Error Handling

---

## Standard Error Format

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

## Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

## Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ],
  "statusCode": 400
}
```

---

## Rate Limit Error

```json
{
  "success": false,
  "message": "Too many requests",
  "retryAfter": 60
}
```

---

# Example Flows

---

## Authentication Flow

```bash
POST /auth/user/register
POST /auth/user/account-verify?purpose=verification
POST /auth/user/login
```

---

## Project and Task Flow

```bash
POST /project/create
POST /task/create
POST /task/:task_id/subtasks
```

---

# Notes

* Uses session cookies for authentication
* All timestamps are in ISO 8601 (UTC)
* Supports soft delete and restore
* GitHub issues can automatically sync as tasks

---

**Last Updated:** March 18, 2026
**API Version:** `0.0.0`
