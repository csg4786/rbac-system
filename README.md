# Role-Based Access Control (RBAC) System

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contact](#contact)

---

## About the Project

This project implements a Role-Based Access Control (RBAC) System to manage users, roles, and permissions efficiently. It provides an API to handle user authentication, authorization, and CRUD operations while enforcing different access levels for `Admin`, `Moderator`, and `User` roles.

---

## Features

- Authentication & Authorization:
    - Secure login and logout.
    - Token-based authentication (JWT).
    - Role-specific authorization.

- CRUD Operations:
    - Create, read, update, and delete user profiles.

- Role Management:
    - Role modification for users by Admin.
    - Filtering, Sorting, and Pagination for user lists.

- File Uploads:
    - Handles profile picture uploads.

---

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Multer
- **Validation**: Express Validator
- **Error Handling**: Custom middleware for structured error responses

---

## System Architecture

- Below is the schematic system architecture diagram:
Schematic Diagram:

    **[Client]** → **[API Gateway]** → **[Authentication Middleware]** → **[RBAC Logic]** → **[Database]**

### Schematic Diagram Description

- **Client**: Interacts with the API (Postman, front-end app, or CLI tools).
- **API Gateway**: Routes incoming requests to the appropriate endpoints.
- **Authentication Middleware**: Validates JWTs for secure access.
- **RBAC Logic**: Implements role-based checks for user actions.
- **Database**: Stores user data and permissions securely in MongoDB.

---

## Prerequisites

- Node.js (v14+)
- MongoDB (Local or Cloud Instance)
- NPM or Yarn

---

## Installation
Clone the repository:

```bash
git clone https://github.com/your-username/rbac-system.git
cd rbac-system
```

Install dependencies:

```bash
npm install
```

Run the application:


```bash
npm start
```


---

## Environment Variables

Create a .env file in the root directory with the following keys:

Note: In `MONGODB_URL1` put the connection string till `...mongodb.net/` and the rest in `MONGODB_URL2`

```env
NODE_ENV=development
MONGODB_URL1=
MONGODB_URL2=
JWT_SECRET=
SALTROUNDS=
```

---

## Usage

- Use Postman or similar tools to test the API.
- Authentication is required for all routes.
- Admin has full access to all routes, while Moderators and Users have limited access.

### API Endpoints

#### Authentication

| Method | Endpoint      | Description      |
|--------|---------------|------------------|
| POST   | `/auth/login` | Log in a user    |
| GET    | `/auth/logout`| Log out a user   |

#### User Management

| Method  | Endpoint                              | Description                       |
|---------|---------------------------------------|-----------------------------------|
| GET     | `/users/`                             | Fetch all users (Admin/Moderator) |
| GET     | `/users/:id`                          | Fetch a specific user             |
| POST    | `/users/add`                          | Add a new user (Admin/Moderator)  |
| PATCH   | `/users/update/:id`                   | Update user details               |
| DELETE  | `/users/remove/:id`                   | Remove a user (Admin/Moderator)   |
| PATCH   | `/users/change-role/:id`              | Change user role (Admin only)     |
| PATCH   | `/users/toggle-active-status/:id`     | Toggle user active status         |


### All roles

- Admin
- Moderator
- User

### Admin

- `/users/` : gets the list of all the users (including admins and moderators)
- `/users/:id` : gets the particular user data (including admins and moderators)
- `/users/add` : adds a new user
- `/users/update/:id` : updates a user (including admins and moderators)
- `/users/remove/:id` : removes a user (including admins and moderators)
- `/users/change-role/:id` : changes the role of a user (including other admins and moderators)
- `/users/toggle-active-status/:id` : activate/deactivate user's functions (including other admins and moderators)

### Moderator

- `/users/` : gets the list of all the users (including moderators)
- `/users/:id` : gets the particular user data (including moderators)
- `/users/add` : adds a new user
- `/users/update/:id` : updates a user (including self)
- `/users/remove/:id` : removes a user
- `/users/toggle-active-status/:id` : activate/deactivate user's functions

### User

- `/users/:id` : gets the particular user data (only self)
- `/users/update/:id` : updates a user (only self)

---

## Contact

- Author: Chandrashekhar Gouda
- GitHub: [csg4786](https://github.com/csg4786)

---

## Schematic System Architecture Diagram
Here’s a visual representation of the system:

Client

Browser or Postman → Sends HTTP Requests.
API Gateway

Routes requests to the correct controller.
Middleware

Validates user authentication (JWTs).
Authorizes based on roles and permissions.
RBAC Logic

Validates role-specific actions (Admin, Moderator, User).
Database

Stores user information, roles, and permissions.