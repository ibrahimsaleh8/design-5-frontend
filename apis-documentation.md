# CMS API Documentation

> **Base URL:** `http://localhost:5000`  
> **API Version:** 1.0.0  
> **Content-Type:** `application/json` (except file uploads which use `multipart/form-data`)

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Public APIs](#public-apis)
  - [Articles (Public)](#articles-public)
    - [GET /api/articles — List Articles](#get-apiarticles--list-articles)
    - [GET /api/articles/homepage — Homepage Articles by Category](#get-apiarticleshomepage--homepage-articles-by-category)
    - [GET /api/articles/:slug — Get Single Article](#get-apiarticlesslug--get-single-article)
  - [Categories (Public)](#categories-public)
  - [Site Settings (Public)](#site-settings-public)
  - [Socials (Public)](#socials-public)
- [Admin APIs](#admin-apis)
  - [Auth Endpoints](#auth-endpoints)
  - [Articles (Admin)](#articles-admin)
  - [Categories (Admin)](#categories-admin)
  - [Site Settings (Admin)](#site-settings-admin)
  - [Socials (Admin)](#socials-admin)
  - [File Upload (Admin)](#file-upload-admin)

---

## Overview

The CMS API is a RESTful service built with Express 5, Prisma 7, and PostgreSQL. It provides both public endpoints (no authentication required) and admin-protected endpoints secured with JWT.

### Authentication Methods

Admin endpoints require a valid JWT token provided as:

1. **Authorization Header (recommended):**
   ```
   Authorization: Bearer <token>
   ```

2. **HTTP Cookie:**
   ```
   Cookie: token=<token>
   ```

The token is returned on successful login or admin setup.

---

## Response Format

All responses follow a consistent JSON envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

List endpoints include pagination metadata:

```json
{
  "success": true,
  "message": "Articles fetched.",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## Error Codes

| HTTP Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — missing or invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found |
| `409` | Conflict — duplicate resource or constraint violation |
| `500` | Internal Server Error |

**Error response shape:**
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

---

---

# Public APIs

No authentication required for these endpoints.

---

## Articles (Public)

### GET /api/articles — List Articles

Returns a paginated list of articles. Supports search, category filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page (max 100) |
| `search` | string | — | Search in title and keywords |
| `category` | string | — | Filter by category slug |
| `sort` | string | `createdAt:desc` | Sort field and direction. Options: `title:asc`, `title:desc`, `createdAt:asc`, `createdAt:desc`, `updatedAt:asc`, `updatedAt:desc` |

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/articles?page=1&limit=5&search=tech&category=programming&sort=createdAt:desc"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Articles fetched.",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "coverImageUrl": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/articles/cover.jpg",
      "title": "Getting Started with TypeScript",
      "slug": "getting-started-with-typescript",
      "keywords": ["typescript", "javascript", "programming"],
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-01T10:00:00.000Z",
      "category": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Programming",
        "slug": "programming"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /api/articles/homepage — Homepage Articles by Category

Returns all categories along with the latest 10 articles for each category (ordered by creation date descending). Designed for rendering homepage sections categorized by topic.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | `10` | Maximum number of articles per category (max 50) |

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/articles/homepage?limit=10"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Homepage articles fetched.",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Programming",
      "slug": "programming",
      "createdAt": "2026-08-01T09:00:00.000Z",
      "articles": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "coverImageUrl": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/articles/cover.jpg",
          "coverImageId": "cms/articles/cover_xyz",
          "title": "Getting Started with TypeScript",
          "slug": "getting-started-with-typescript",
          "content": "<p>TypeScript is a strongly typed programming language...</p>",
          "keywords": ["typescript", "javascript", "programming"],
          "createdAt": "2026-08-01T10:00:00.000Z",
          "updatedAt": "2026-08-01T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

### GET /api/articles/:slug — Get Single Article

Returns a single article with full content by its slug.

**Path Parameters:**

| Parameter | Description |
|---|---|
| `slug` | Article slug (auto-generated from title) |

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/articles/getting-started-with-typescript"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Article fetched.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "coverImageUrl": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/articles/cover.jpg",
    "coverImageId": "cms/articles/cover_xyz",
    "title": "Getting Started with TypeScript",
    "slug": "getting-started-with-typescript",
    "content": "<p>TypeScript is a strongly typed programming language...</p>",
    "keywords": ["typescript", "javascript", "programming"],
    "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-01T10:00:00.000Z",
    "category": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Programming",
      "slug": "programming"
    }
  }
}
```

**Error `404 Not Found`:**
```json
{
  "success": false,
  "message": "Article not found."
}
```

---

## Categories (Public)

### GET /api/categories — List All Categories

Returns all categories ordered alphabetically, including article count.

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/categories"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Categories fetched.",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Programming",
      "slug": "programming",
      "createdAt": "2026-08-01T09:00:00.000Z",
      "_count": {
        "articles": 5
      }
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Design",
      "slug": "design",
      "createdAt": "2026-08-01T09:30:00.000Z",
      "_count": {
        "articles": 3
      }
    }
  ]
}
```

---

### GET /api/categories/:slug — Get Single Category

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/categories/programming"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category fetched.",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Programming",
    "slug": "programming",
    "createdAt": "2026-08-01T09:00:00.000Z",
    "_count": {
      "articles": 5
    }
  }
}
```

---

## Site Settings (Public)

### GET /api/settings — Get Site Settings

Returns the CMS site metadata and homepage configuration.

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/settings"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Site settings fetched.",
  "data": {
    "id": 1,
    "projectName": "My CMS Site",
    "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
    "metaTitle": "My CMS Site",
    "metaDescription": "Welcome to my CMS-powered website",
    "metaKeywords": "cms, blog, articles",
    "heroTitle": "Welcome to Our Site",
    "heroDescription": "Explore our latest articles and content"
  }
}
```

---

## Socials (Public)

### GET /api/socials — Get Social Links

Returns all configured social media links.

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/socials"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Socials fetched.",
  "data": {
    "id": 1,
    "facebook": "https://facebook.com/mypage",
    "twitter": "https://twitter.com/myhandle",
    "instagram": "https://instagram.com/myprofile",
    "youtube": "https://youtube.com/@mychannel",
    "whatsapp": "+1234567890",
    "phoneNumber": "+1234567890"
  }
}
```

---

---

# Admin APIs

All admin endpoints require a valid JWT token.

**Authentication Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### POST /api/auth/setup — First-Time Admin Registration

One-time endpoint to create the initial admin account. **Blocked once an admin exists.**

Requires the `SECRET_PASSWORD` environment variable value as the `password` field.

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "your_SECRET_PASSWORD_value"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/setup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "p2C8%4pwl6"
  }'
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Admin created successfully.",
  "data": {
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin Name",
      "email": "admin@example.com",
      "createdAt": "2026-08-07T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error `409 Conflict`** (admin already exists):
```json
{
  "success": false,
  "message": "Admin already exists. Use /api/auth/login to sign in."
}
```

**Error `403 Forbidden`** (wrong secret password):
```json
{
  "success": false,
  "message": "Invalid setup password."
}
```

---

### POST /api/auth/login — Admin Login

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> The JWT token is also set as an `HttpOnly` cookie named `token` with a 7-day expiry.

**Error `401 Unauthorized`:**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### POST /api/auth/logout — Admin Logout

🔒 **Requires Authentication**

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/logout" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

---

### GET /api/auth/me — Get Current Admin Profile

🔒 **Requires Authentication**

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Admin profile fetched.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin Name",
    "email": "admin@example.com",
    "createdAt": "2026-08-07T10:00:00.000Z"
  }
}
```

---

### PATCH /api/auth/change-password — Change Password

🔒 **Requires Authentication**

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

**cURL Example:**
```bash
curl -X PATCH "http://localhost:5000/api/auth/change-password" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "old_password",
    "newPassword": "new_secure_password"
  }'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Password changed. Please log in again.",
  "data": null
}
```

**Error `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Current password is incorrect."
}
```

---

### PATCH /api/auth/profile — Update Admin Profile

🔒 **Requires Authentication**

**Request Body:** (all fields optional, at least one required)
```json
{
  "name": "New Name",
  "email": "new@example.com"
}
```

**cURL Example:**
```bash
curl -X PATCH "http://localhost:5000/api/auth/profile" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Admin"}'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Profile updated.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Admin",
    "email": "admin@example.com",
    "createdAt": "2026-08-07T10:00:00.000Z"
  }
}
```

---

## Articles (Admin)

### GET /api/admin/articles — List All Articles (Admin)

🔒 **Requires Authentication**

Same query parameters as the public endpoint, plus filtering by `categoryId`.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page (max 100) |
| `search` | string | — | Search in title and keywords |
| `category` | string | — | Filter by category slug |
| `categoryId` | string | — | Filter by category UUID |
| `sort` | string | `createdAt:desc` | Sort options: `title:asc`, `title:desc`, `createdAt:asc/desc`, `updatedAt:asc/desc` |

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/admin/articles?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Articles fetched.",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "coverImageUrl": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/articles/cover.jpg",
      "coverImageId": "cms/articles/cover_xyz",
      "title": "Getting Started with TypeScript",
      "slug": "getting-started-with-typescript",
      "content": "<p>TypeScript is a strongly typed programming language...</p>",
      "keywords": ["typescript", "javascript"],
      "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-01T10:00:00.000Z",
      "category": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Programming",
        "slug": "programming"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /api/admin/articles/:id — Get Article by ID (Admin)

🔒 **Requires Authentication**

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/admin/articles/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:** *(same shape as list item above)*

---

### POST /api/admin/articles — Create Article

🔒 **Requires Authentication**

Slug is automatically generated from `title`. If a slug collision exists, a numeric suffix is appended (`-1`, `-2`, etc.).

**Request Body:**
```json
{
  "title": "My New Article",
  "content": "<p>Full HTML content of the article...</p>",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "keywords": ["keyword1", "keyword2"],
  "coverImageUrl": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/articles/cover.jpg",
  "coverImageId": "cms/articles/cover_xyz"
}
```

> `keywords`, `coverImageUrl`, and `coverImageId` are optional.

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/admin/articles" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Article",
    "content": "<p>Article content here...</p>",
    "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "keywords": ["news", "tech"],
    "coverImageUrl": "https://res.cloudinary.com/.../cover.jpg",
    "coverImageId": "cms/articles/cover_xyz"
  }'
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Article created.",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "coverImageUrl": "https://res.cloudinary.com/.../cover.jpg",
    "coverImageId": "cms/articles/cover_xyz",
    "title": "My New Article",
    "slug": "my-new-article",
    "content": "<p>Article content here...</p>",
    "keywords": ["news", "tech"],
    "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2026-08-07T12:00:00.000Z",
    "updatedAt": "2026-08-07T12:00:00.000Z",
    "category": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Programming",
      "slug": "programming"
    }
  }
}
```

**Error `400 Bad Request`:**
```json
{
  "success": false,
  "message": "title is required."
}
```

**Error `404 Not Found`:**
```json
{
  "success": false,
  "message": "Category not found."
}
```

---

### PATCH /api/admin/articles/:id — Update Article

🔒 **Requires Authentication**

All fields are optional. Only provided fields are updated. If `title` changes, slug is automatically regenerated.

**Request Body:** *(all optional)*
```json
{
  "title": "Updated Article Title",
  "content": "<p>Updated content...</p>",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "keywords": ["updated", "keywords"],
  "coverImageUrl": "https://res.cloudinary.com/.../new_cover.jpg",
  "coverImageId": "cms/articles/new_cover_xyz"
}
```

**cURL Example:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/articles/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Article Title"}'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Article updated.",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Updated Article Title",
    "slug": "updated-article-title",
    "content": "<p>Article content here...</p>",
    "keywords": ["news", "tech"],
    "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2026-08-07T12:00:00.000Z",
    "updatedAt": "2026-08-07T13:00:00.000Z",
    "category": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Programming",
      "slug": "programming"
    }
  }
}
```

---

### DELETE /api/admin/articles/:id — Delete Article

🔒 **Requires Authentication**

**cURL Example:**
```bash
curl -X DELETE "http://localhost:5000/api/admin/articles/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Article deleted.",
  "data": null
}
```

---

## Categories (Admin)

### GET /api/admin/categories — List Categories (Admin)

🔒 **Requires Authentication**

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/admin/categories" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Categories fetched.",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Programming",
      "slug": "programming",
      "createdAt": "2026-08-01T09:00:00.000Z",
      "_count": {
        "articles": 5
      }
    }
  ]
}
```

---

### GET /api/admin/categories/:id — Get Category by ID (Admin)

🔒 **Requires Authentication**

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/admin/categories/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/admin/categories — Create Category

🔒 **Requires Authentication**

Slug is auto-generated from title.

**Request Body:**
```json
{
  "title": "Technology"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/admin/categories" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Technology"}'
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Category created.",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-012345678901",
    "title": "Technology",
    "slug": "technology",
    "createdAt": "2026-08-07T14:00:00.000Z"
  }
}
```

---

### PATCH /api/admin/categories/:id — Update Category

🔒 **Requires Authentication**

**Request Body:**
```json
{
  "title": "Tech & Innovation"
}
```

**cURL Example:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/categories/c3d4e5f6-a7b8-9012-cdef-012345678901" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tech & Innovation"}'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category updated.",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-012345678901",
    "title": "Tech & Innovation",
    "slug": "tech-innovation",
    "createdAt": "2026-08-07T14:00:00.000Z"
  }
}
```

---

### DELETE /api/admin/categories/:id — Delete Category

🔒 **Requires Authentication**

> ⚠️ **Blocked if the category contains any articles.** Move or delete all articles first.

**cURL Example:**
```bash
curl -X DELETE "http://localhost:5000/api/admin/categories/c3d4e5f6-a7b8-9012-cdef-012345678901" \
  -H "Authorization: Bearer <token>"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category deleted.",
  "data": null
}
```

**Error `409 Conflict`** (has articles):
```json
{
  "success": false,
  "message": "Cannot delete category \"Technology\" because it contains 3 article(s). Move or delete those articles first."
}
```

---

## Site Settings (Admin)

### PUT /api/admin/settings — Update Site Settings

🔒 **Requires Authentication**

Creates the singleton record if it doesn't exist (upsert). All fields are optional — only provided fields are updated.

**Request Body:** *(all optional)*
```json
{
  "projectName": "My Awesome Site",
  "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
  "metaTitle": "My Awesome Site",
  "metaDescription": "The best CMS-powered website",
  "metaKeywords": "blog, tech, tutorials",
  "heroTitle": "Welcome to My Site",
  "heroDescription": "Discover amazing content every day"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:5000/api/admin/settings" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My Awesome Site",
    "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
    "metaTitle": "My Awesome Site",
    "metaDescription": "The best CMS-powered website",
    "metaKeywords": "blog, tech, tutorials",
    "heroTitle": "Welcome to My Site",
    "heroDescription": "Discover amazing content every day"
  }'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Site settings updated.",
  "data": {
    "id": 1,
    "projectName": "My Awesome Site",
    "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
    "metaTitle": "My Awesome Site",
    "metaDescription": "The best CMS-powered website",
    "metaKeywords": "blog, tech, tutorials",
    "heroTitle": "Welcome to My Site",
    "heroDescription": "Discover amazing content every day"
  }
}
```

---

## Socials (Admin)

### PUT /api/admin/socials — Update Social Links

🔒 **Requires Authentication**

Creates the singleton record if it doesn't exist (upsert). All fields are optional. Set a field to `null` to clear it.

**Request Body:** *(all optional)*
```json
{
  "facebook": "https://facebook.com/mypage",
  "twitter": "https://twitter.com/myhandle",
  "instagram": "https://instagram.com/myprofile",
  "youtube": "https://youtube.com/@mychannel",
  "whatsapp": "+1234567890",
  "phoneNumber": "+1234567890"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:5000/api/admin/socials" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "facebook": "https://facebook.com/mypage",
    "instagram": "https://instagram.com/myprofile",
    "whatsapp": "+1234567890"
  }'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Socials updated.",
  "data": {
    "id": 1,
    "facebook": "https://facebook.com/mypage",
    "twitter": null,
    "instagram": "https://instagram.com/myprofile",
    "youtube": null,
    "whatsapp": "+1234567890",
    "phoneNumber": null
  }
}
```

---

## File Upload (Admin)

### POST /api/admin/upload/image — Upload Image

🔒 **Requires Authentication**

Uploads an image to Cloudinary under the `cms/articles` folder. Use the returned `url` and `publicId` when creating/updating articles.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `image` | File | Yes | Image file. Allowed types: JPEG, PNG, WebP, GIF, SVG. Max size: 5 MB. |

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/admin/upload/image" \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/your/image.jpg"
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Image uploaded successfully.",
  "data": {
    "url": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/articles/image_xyz.jpg",
    "publicId": "cms/articles/image_xyz"
  }
}
```

**Error `400 Bad Request`** (no file):
```json
{
  "success": false,
  "message": "No image file provided. Use field name: image."
}
```

**Error `400 Bad Request`** (wrong file type):
```json
{
  "success": false,
  "message": "Unsupported file type: application/pdf. Allowed: JPEG, PNG, WebP, GIF, SVG."
}
```

**Error `400 Bad Request`** (file too large):
```json
{
  "success": false,
  "message": "File is too large. Maximum size is 5 MB."
}
```

---

### DELETE /api/admin/upload/image — Delete Image

🔒 **Requires Authentication**

Permanently deletes an image from Cloudinary using its public ID.

**Request Body:**
```json
{
  "publicId": "cms/articles/image_xyz"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:5000/api/admin/upload/image" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"publicId": "cms/articles/image_xyz"}'
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Image deleted.",
  "data": {
    "publicId": "cms/articles/image_xyz",
    "result": "ok"
  }
}
```

**Error `400 Bad Request`:**
```json
{
  "success": false,
  "message": "publicId is required."
}
```

---

## Typical Frontend Integration Workflow

### 1. Initial Setup (run once)
```bash
# Create first admin
curl -X POST http://localhost:5000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@cms.com","password":"YOUR_SECRET_PASSWORD"}'
```

### 2. Login and Save Token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cms.com","password":"your_password"}' | \
  python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
```

### 3. Create a Category
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Technology"}'
```

### 4. Upload a Cover Image
```bash
curl -X POST http://localhost:5000/api/admin/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@cover.jpg"
# Returns: { url, publicId }
```

### 5. Create an Article
```bash
curl -X POST http://localhost:5000/api/admin/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "content": "<p>Content here...</p>",
    "categoryId": "CATEGORY_ID_FROM_STEP_3",
    "keywords": ["tech", "news"],
    "coverImageUrl": "URL_FROM_STEP_4",
    "coverImageId": "PUBLIC_ID_FROM_STEP_4"
  }'
```

---

*Documentation generated for CMS API v1.0.0 — Last updated: 2026-08-07*
