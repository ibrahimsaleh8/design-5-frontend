# Hero & Site Settings API Documentation

> **Base URL:** `http://localhost:5000`  
> **Content-Type:** `application/json`

---

## Overview

The Site Settings API manages global website settings and homepage hero section content, including `heroTitle`, `heroDescription`, and `heroImage`. It also provides an image upload endpoint (`POST /api/admin/upload/image`) to upload hero banner images and website logos.

---

## Endpoints

### 1. GET /api/settings — Get Site Settings (Public)

Returns global CMS site settings and homepage hero configuration.

- **Authentication:** None (Public)
- **Method:** `GET`
- **Path:** `/api/settings`

#### cURL Example
```bash
curl -X GET "http://localhost:5000/api/settings"
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Site settings fetched.",
  "data": {
    "id": 1,
    "projectName": "تأجير دفايات السعودية",
    "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
    "metaTitle": "تأجير دفايات بالسعودية | أفضل أسعار وأمان تام",
    "metaDescription": "خدمة تأجير دفايات في جميع مناطق المملكة العربية السعودية. دفايات غازية وكهربائية للمنازل والفعاليات والشركات. توصيل سريع وصيانة مجانية.",
    "metaKeywords": "تأجير دفايات, دفايات للإيجار, تأجير دفايات الرياض, تأجير دفايات جدة",
    "heroTitle": "خدمة تأجير دفايات موثوقة في جميع أنحاء المملكة",
    "heroDescription": "نوفر أفضل حلول التدفئة للمنازل والفعاليات والشركات. دفايات غازية وكهربائية بأسعار منافسة مع توصيل سريع وصيانة مجانية طوال مدة الإيجار.",
    "heroImage": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/hero/hero_cover.jpg"
  }
}
```

---

### 2. POST /api/admin/upload/image — Upload Image / Hero Image (Admin)

Uploads an image file (e.g. Hero section banner/cover or Logo) to cloud storage and returns the uploaded image URL and public ID.

- **Authentication:** Required (`Bearer <jwt_token>` header or `token` cookie)
- **Method:** `POST`
- **Path:** `/api/admin/upload/image`
- **Content-Type:** `multipart/form-data`

#### Request Body
| Field | Type | Description | Required |
|---|---|---|---|
| `image` | File | Image file (JPG, PNG, WEBP, GIF) | Yes |

#### cURL Example
```bash
curl -X POST "http://localhost:5000/api/admin/upload/image" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "image=@/path/to/hero_banner.jpg"
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/hero/hero_cover.jpg",
    "publicId": "cms/hero/hero_cover"
  }
}
```

#### Error Response `400 Bad Request`
```json
{
  "success": false,
  "message": "No image file provided"
}
```

---

### 3. PUT /api/admin/settings — Update Site Settings & Hero Section (Admin)

Updates the singleton site settings record and hero banner configuration (`heroTitle`, `heroDescription`, `heroImage`). If the record does not exist, it will be automatically created (upsert).

- **Authentication:** Required (`Bearer <jwt_token>` header or `token` cookie)
- **Method:** `PUT`
- **Path:** `/api/admin/settings`

#### Request Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body Schema

| Field | Type | Description | Optional |
|---|---|---|---|
| `projectName` | string | Site/Application name | Yes |
| `logo` | string | URL to site logo image | Yes |
| `metaTitle` | string | Default SEO meta title | Yes |
| `metaDescription` | string | Default SEO meta description | Yes |
| `metaKeywords` | string | Default SEO meta keywords | Yes |
| `heroTitle` | string | Homepage hero section main heading | Yes |
| `heroDescription` | string | Homepage hero section subtitle / description | Yes |
| `heroImage` | string | URL of the hero banner/cover image | Yes |

> **Workflow for Uploading Hero Image:**
> 1. Call `POST /api/admin/upload/image` with the hero image file (`multipart/form-data`).
> 2. Retrieve the returned image URL from `data.url`.
> 3. Send a `PUT /api/admin/settings` request with `"heroImage": "<uploaded_url>"`.

#### Request Body Example
```json
{
  "projectName": "تأجير دفايات السعودية",
  "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
  "metaTitle": "تأجير دفايات بالسعودية | أفضل أسعار وأمان تام",
  "metaDescription": "خدمة تأجير دفايات في جميع مناطق المملكة العربية السعودية.",
  "metaKeywords": "تأجير دفايات, دفايات للإيجار",
  "heroTitle": "خدمة تأجير دفايات موثوقة في جميع أنحاء المملكة",
  "heroDescription": "نوفر أفضل حلول التدفئة للمنازل والفعاليات والشركات.",
  "heroImage": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/hero/hero_cover.jpg"
}
```

#### cURL Example
```bash
curl -X PUT "http://localhost:5000/api/admin/settings" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "تأجير دفايات السعودية",
    "heroTitle": "خدمة تأجير دفايات موثوقة في جميع أنحاء المملكة",
    "heroDescription": "نوفر أفضل حلول التدفئة للمنازل والفعاليات والشركات.",
    "heroImage": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/hero/hero_cover.jpg"
  }'
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Site settings updated.",
  "data": {
    "id": 1,
    "projectName": "تأجير دفايات السعودية",
    "logo": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/logo.png",
    "metaTitle": "تأجير دفايات بالسعودية | أفضل أسعار وأمان تام",
    "metaDescription": "خدمة تأجير دفايات في جميع مناطق المملكة العربية السعودية.",
    "metaKeywords": "تأجير دفايات, دفايات للإيجار",
    "heroTitle": "خدمة تأجير دفايات موثوقة في جميع أنحاء المملكة",
    "heroDescription": "نوفر أفضل حلول التدفئة للمنازل والفعاليات والشركات.",
    "heroImage": "https://res.cloudinary.com/dg8bbwiu5/image/upload/v1720000000/cms/hero/hero_cover.jpg"
  }
}
```

#### Error Response `401 Unauthorized`
```json
{
  "success": false,
  "message": "Unauthorized. Token missing or invalid."
}
```
