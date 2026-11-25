# 2NOMADS Transportation Design Studio & Academy — Backend API

Robust, production-ready REST API for **2NOMADS Transportation Design Studio & Academy** (Pune, India). Built with Node.js, TypeScript, Express, Sequelize ORM, and PostgreSQL.

---

## 🏎️ Brand & Business Context

**2NOMADS** is an automotive and transportation design studio and academy based in Bhosari, Pune, India, founded by veteran automotive designer and clay modeller **R Donshong Koren**.
- **Studio Division:** Provides OEM-grade automotive design services, scale and full-size (1:1) clay modeling, surface scanning, and functional show/working vehicle prototyping (trusted by OEMs such as Classic Legend, Pluto Mobility, and Hindustan Motors).
- **Academy Division:** Hands-on professional courses taught by industry veterans covering Transportation Design, Clay Modelling, Digital Sculpting (NURBS/Class-A CAD), 3D Scanning & Reverse Engineering, Prototyping, and the flagship *Master Classes Season 01 (Oneaxi Scooter concept to prototype)*.

---

## 🏛️ Architecture & Design Pattern

The backend follows a strict **Controller -> Service -> Repository** layered architecture:

```
src/
├── app.ts                  # Express application setup, middlewares, routes, error handlers
├── server.ts               # HTTP Server bootstrapper & DB connection check
├── config/
│   ├── database.ts         # Sequelize PostgreSQL connection pool
│   └── env.ts              # Type-safe environment config validated with Zod
├── models/                 # Sequelize Models with UUID primary keys & timestamps
│   ├── Admin.ts            # Admin user accounts (super_admin, staff)
│   ├── Course.ts           # Academy courses with JSONB syllabus
│   ├── Student.ts          # Student course registrations & admissions pipeline
│   ├── Inquiry.ts          # Studio OEM & Academy general contact inquiries
│   ├── CommunicationLog.ts # Audit trail for email/whatsapp notifications
│   └── index.ts            # Model relationships & associations
├── repositories/           # Direct data access layer
│   ├── admin.repository.ts
│   ├── course.repository.ts
│   ├── student.repository.ts
│   ├── inquiry.repository.ts
│   ├── communication-log.repository.ts
│   └── dashboard.repository.ts
├── services/               # Core business logic layer
│   ├── auth.service.ts
│   ├── course.service.ts
│   ├── student.service.ts
│   ├── inquiry.service.ts
│   ├── email.service.ts        # Nodemailer SMTP with responsive HTML templates
│   ├── whatsapp.service.ts     # Meta WhatsApp Cloud API integration & mock handler
│   ├── communication.service.ts # Unified email/WhatsApp orchestration & audit trail
│   └── dashboard.service.ts
├── controllers/            # HTTP Request/Response orchestration layer
│   ├── auth.controller.ts
│   ├── course.controller.ts
│   ├── student.controller.ts
│   ├── inquiry.controller.ts
│   ├── communication.controller.ts
│   └── dashboard.controller.ts
├── routes/                 # Express routing & middleware binding
│   ├── auth.routes.ts
│   ├── course.routes.ts
│   ├── student.routes.ts
│   ├── inquiry.routes.ts
│   ├── communication.routes.ts
│   ├── admin.routes.ts
│   ├── dashboard.routes.ts
│   └── index.ts
├── middlewares/            # Security, Auth, Validation & Error Handling
│   ├── auth.middleware.ts  # JWT Bearer token authentication & role checks
│   ├── validation.middleware.ts # Zod schema request validation
│   ├── error.middleware.ts # Centralized exception handling (AppError, Zod, Sequelize)
│   └── not-found.middleware.ts  # 404 handler
├── validations/            # Zod validation schemas
│   ├── auth.validation.ts
│   ├── course.validation.ts
│   ├── student.validation.ts
│   ├── inquiry.validation.ts
│   └── communication.validation.ts
├── database/               # Database management scripts
│   ├── migrate.ts          # Schema synchronization & UUID extension setup
│   ├── seed.ts             # Default super_admin & authentic course seed data
│   └── test-api.ts         # Automated end-to-end API verification suite (18 suites)
└── types/                  # TypeScript interface augmentations
```

---

## 🗄️ Database Schema & Models

All models use **UUID v4 primary keys** and automatic `created_at` / `updated_at` timestamps.

### 1. `Admin`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `name` | STRING(128) | NOT NULL | Admin full name |
| `email` | STRING(255) | NOT NULL, UNIQUE | Admin email address |
| `password_hash` | STRING(255) | NOT NULL | Bcrypt-hashed password |
| `role` | ENUM | NOT NULL, default 'staff' | `'super_admin'` or `'staff'` |
| `is_active` | BOOLEAN | NOT NULL, default true | Active account toggle |

### 2. `Course`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `title` | STRING(255) | NOT NULL | Course title |
| `slug` | STRING(255) | NOT NULL, UNIQUE | SEO URL slug |
| `description` | TEXT | NOT NULL | Full course overview |
| `duration` | STRING(100) | NOT NULL | e.g. "12 Weeks", "8 Weeks" |
| `fee` | DECIMAL(10,2) | NOT NULL | Course fee in INR |
| `mode` | ENUM | NOT NULL, default 'offline' | `'online'`, `'offline'`, `'hybrid'` |
| `syllabus` | JSONB | NOT NULL, default `[]` | Structured curriculum modules |
| `is_published` | BOOLEAN | NOT NULL, default true | Visibility on public site |

### 3. `Student`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `full_name` | STRING(255) | NOT NULL | Student's full name |
| `email` | STRING(255) | NOT NULL | Student's email |
| `phone` | STRING(50) | NOT NULL | Mobile phone number |
| `whatsapp_number` | STRING(50) | NULLABLE | WhatsApp number for alerts |
| `course_id` | UUID | FK -> `courses.id` | Registered course |
| `status` | ENUM | default `'new'` | `'new'`, `'contacted'`, `'enrolled'`, `'dropped'` |
| `notes` | TEXT | NULLABLE | Counselor/admin internal notes |
| `registered_at` | TIMESTAMP | NOT NULL, default NOW | Timestamp of registration |

### 4. `Inquiry`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `name` | STRING(255) | NOT NULL | Client or prospect name |
| `email` | STRING(255) | NOT NULL | Email address |
| `phone` | STRING(50) | NOT NULL | Phone number |
| `type` | ENUM | NOT NULL | `'studio_project'` or `'academy_general'` |
| `message` | TEXT | NOT NULL | Inquiry message or RFP details |
| `status` | ENUM | default `'open'` | `'open'` or `'resolved'` |

### 5. `CommunicationLog`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `recipient_type` | ENUM | NOT NULL | `'student'` or `'inquiry'` |
| `recipient_id` | UUID | NOT NULL | Foreign reference to Student/Inquiry |
| `channel` | ENUM | NOT NULL | `'email'` or `'whatsapp'` |
| `template_name` | STRING(128) | NOT NULL | Notification template identifier |
| `payload` | JSONB | NOT NULL, default `{}` | Dispatch metadata & context |
| `status` | ENUM | NOT NULL | `'sent'` or `'failed'` |
| `error_message` | TEXT | NULLABLE | Failure trace if dispatch failed |
| `sent_at` | TIMESTAMP | NOT NULL, default NOW | Dispatch timestamp |

---

## ✉️ & 💬 Communication Workflows

### 1. Automated Workflows (Non-blocking / Background Async)
* **Student Registration (`POST /api/v1/students/register`):**
  1. Sends branded HTML Confirmation Email to the student.
  2. Sends WhatsApp Confirmation to student's WhatsApp number.
  3. Sends New Application Alert Email to the admin (`admin@2nomads.design`).
  4. Records every dispatch attempt in `CommunicationLog`.
* **Contact Inquiries (`POST /api/v1/inquiries`):**
  1. Sends Admin Alert Email with inquiry type (`studio_project` or `academy_general`).
  2. Sends Acknowledgment Email to client.
  3. Records dispatch in `CommunicationLog`.

### 2. Manual Communication Dispatch
* Admins can trigger personalized emails or WhatsApp messages directly to any student or inquiry via `POST /api/v1/communications/send`.
* Audit trail for all communications is accessible at `GET /api/v1/communications/logs`.

### 3. Mock Mode Support
* When `SMTP_MOCK_MODE=true` or SMTP credentials are omitted, emails are simulated and logged to console with zero crashes.
* When `WHATSAPP_MOCK_MODE=true` or Meta tokens are omitted, WhatsApp messages are simulated and logged with mock WAMID IDs.

---

## ⚡ Quick Start & Setup

### 1. Environment Configuration
Ensure your PostgreSQL database is running. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Key environment variables:
```ini
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nomads_db
DB_USER=postgres
DB_PASSWORD=root
JWT_SECRET=nomads_super_secret_jwt_key_2026_design_academy
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
DEFAULT_ADMIN_EMAIL=admin@2nomads.design
DEFAULT_ADMIN_PASSWORD=AdminPassword123!
DEFAULT_ADMIN_NAME=R Donshong Koren (Admin)

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="2NOMADS Studio & Academy" <admissions@2nomads.design>
SMTP_MOCK_MODE=true
ADMIN_NOTIFICATION_EMAIL=admin@2nomads.design

# WhatsApp (Meta Cloud API)
WHATSAPP_PHONE_NUMBER_ID=mock_phone_id
WHATSAPP_ACCESS_TOKEN=mock_access_token
WHATSAPP_API_VERSION=v21.0
WHATSAPP_MOCK_MODE=true
```

### 2. Run Database Migrations
```bash
npm run db:migrate
```

### 3. Seed Database
```bash
npm run db:seed
```

Or run both in one step:
```bash
npm run db:setup
```

### 4. Run Automated Integration Tests (All 18 Suites)
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Build & Start Production Server
```bash
npm run build
npm start
```

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status check |
| `GET` | `/api/v1/courses` | List published courses (`?mode=`, `?search=`, pagination) |
| `GET` | `/api/v1/courses/:id` | Get published course details by UUID |
| `GET` | `/api/v1/courses/slug/:slug` | Get published course details by slug |
| `POST` | `/api/v1/students/register` | Register student (triggers async Email + WhatsApp) |
| `POST` | `/api/v1/inquiries` | Submit studio or academy contact inquiry (triggers async email alerts) |

### Admin Endpoints (Requires `Authorization: Bearer <token>`)

#### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Admin login (email + password -> JWT) |
| `GET` | `/api/v1/auth/me` | Fetch authenticated admin profile |

#### Communications
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/communications/send` | Manual send Email or WhatsApp to a student or inquiry |
| `GET` | `/api/v1/communications/logs` | Paginated logs (`?recipientId=`, `?channel=email\|whatsapp`, `?status=sent\|failed`) |

#### Course Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/courses` | List all courses (including drafts) |
| `POST` | `/api/v1/admin/courses` | Create a new course |
| `GET` | `/api/v1/admin/courses/:id` | Get course by ID |
| `PUT` | `/api/v1/admin/courses/:id` | Update course |
| `DELETE` | `/api/v1/admin/courses/:id` | Delete course |

#### Student Registrations Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/students` | List/filter students (`?status=`, `?courseId=`, `?search=`, pagination) |
| `GET` | `/api/v1/admin/students/:id` | Get student details with course information |
| `PATCH` | `/api/v1/admin/students/:id/status` | Update student status (`new`, `contacted`, `enrolled`, `dropped`) & notes |

#### Inquiry Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/inquiries` | List/filter inquiries (`?status=`, `?type=`, `?search=`, pagination) |
| `GET` | `/api/v1/admin/inquiries/:id` | Get inquiry details |
| `PATCH` | `/api/v1/admin/inquiries/:id/status` | Update inquiry status (`open`, `resolved`) |

#### Dashboard Stats
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Aggregated metrics: courses, students by status, inquiries, enrolled revenue |
| `GET` | `/api/v1/admin/dashboard/stats` | Alias for dashboard stats |
