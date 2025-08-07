# 🏥 Schedula - Advanced Healthcare Appointment Management System

<p align="center">
  <strong>Revolutionary Healthcare Scheduling Platform</strong>
  <br>
  <a href="https://www.linkedin.com/in/surya-k-9658992b2" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin" alt="Connect on LinkedIn" />
  </a>
</p>

## 🚀 Overview

**Schedula** is a cutting-edge healthcare appointment management system built with NestJS, TypeScript, and PostgreSQL. It revolutionizes how healthcare providers and patients interact by offering intelligent scheduling, automated notifications, and sophisticated appointment management capabilities.

## ✨ Key Features

### 🎯 **Intelligent Scheduling Strategies**
- **Stream-based Scheduling**: Traditional time-slot based appointments with flexible duration
- **Wave-based Scheduling**: Group appointments in 30-minute waves (max 3 patients per wave) for efficient patient flow
- **Dynamic Slot Adjustment**: Automatically adjusts slot durations based on appointment load
- **Real-time Availability**: Instant slot availability checking with conflict resolution

### 🔐 **Advanced Security & Authentication**
- **JWT-based Authentication**: Secure token-based authentication with HTTP-only cookies
- **Role-based Access Control**: Granular permissions for Patients, Doctors, and Administrators
- **Password Hashing**: Bcrypt encryption for secure password storage
- **Session Management**: Automatic token expiration and renewal

### 📧 **Automated Notification System**
- **Email Notifications**: Automated email alerts for appointment confirmations and rescheduling
- **Real-time Updates**: Instant notifications when appointments are modified
- **Professional Templates**: Well-crafted email templates for different scenarios
- **SMTP Integration**: Configurable email service integration

### 🌍 **Timezone & International Support**
- **IST Timezone Handling**: Native support for Indian Standard Time (UTC+5:30)
- **Automatic Conversion**: Seamless UTC to IST conversion for all time operations
- **Date/Time Validation**: Robust date and time validation with ISO 8601 support
- **Multi-timezone Ready**: Architecture supports multiple timezone implementations

### 🎨 **Smart Appointment Management**
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Intelligent Rescheduling**: AI-powered rescheduling with closest slot matching
- **Status Tracking**: Comprehensive appointment status management (Pending, Confirmed, Rescheduled)
- **Bulk Operations**: Efficient handling of multiple appointment updates

### 🏥 **Healthcare-Specific Features**
- **Doctor Specialization**: Support for different medical specializations
- **Patient Profiles**: Comprehensive patient information management
- **Consulting Days**: Flexible scheduling based on doctor availability
- **Medical Records Integration**: Ready for electronic health record integration

### 🔄 **Advanced Rescheduling Engine**
- **Automatic Conflict Resolution**: Intelligent handling of scheduling conflicts
- **Wave-based Rescheduling**: Efficient rescheduling within wave constraints
- **Slot-based Rescheduling**: Flexible rescheduling with closest slot matching
- **Affected Appointment Detection**: Automatic identification of impacted appointments

### 📊 **Data Management & Analytics**
- **PostgreSQL Database**: Robust, scalable database with TypeORM integration
- **Entity Relationships**: Well-designed database schema with proper relationships
- **Data Validation**: Comprehensive input validation with class-validator
- **Audit Trail**: Complete tracking of appointment changes and modifications

## 🛠 Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Email**: Nodemailer with SMTP
- **Validation**: class-validator & class-transformer
- **Security**: bcrypt for password hashing
- **Deployment**: Ready for cloud deployment

## 📋 API Endpoints

### 🔐 Authentication (`/auth`)

#### POST `/auth/signup`
**Description:** Register a new user
**Body:**
```json
{
  "email": "string",
  "password": "string", 
  "role": "string"
}
```

#### POST `/auth/signin`
**Description:** Login user and get JWT token
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:** Sets JWT cookie and returns user info

---

### 👥 Patient Management (`/patient`)

#### POST `/patient/createPatientProfile`
**Description:** Create a new patient profile
**Authentication:** Requires Patient role
**Body:**
```json
{
  "name": "string",
  "age": "number",
  "gender": "string"
}
```

#### GET `/patient/viewPatients`
**Description:** Get all patients (Doctors only)
**Authentication:** Requires Doctor role

#### GET `/patient/:id`
**Description:** Get patient by ID (Doctors only)
**Authentication:** Requires Doctor role
**Parameters:** `id` (string)

#### PATCH `/patient/:id`
**Description:** Update patient profile
**Authentication:** Requires Patient role
**Parameters:** `id` (string)
**Body:**
```json
{
  "name": "string",     // optional
  "age": "number",      // optional
  "gender": "string"    // optional
}
```

#### DELETE `/patient/:id`
**Description:** Delete patient profile
**Authentication:** Requires Patient role
**Parameters:** `id` (string)

---

### 👨‍⚕️ Doctor Management (`/doctor`)

#### POST `/doctor/createDoctor`
**Description:** Create a new doctor profile
**Authentication:** Requires Doctor role
**Body:**
```json
{
  "name": "string",
  "specialization": "string",
  "experience": "string"
}
```

#### POST `/doctor/createAvailability/:id`
**Description:** Create availability for a doctor
**Authentication:** Requires Doctor role
**Parameters:** `id` (string) - doctor ID
**Body:**
```json
{
  "doctor_id": "number",
  "time": "number",
  "day_of_the_week": ["string"],
  "start_time": "Date",
  "end_time": "Date"
}
```

#### GET `/doctor`
**Description:** Get all doctors

#### GET `/doctor/availability/:id`
**Description:** Get availability for a specific doctor
**Parameters:** `id` (string) - doctor ID

#### GET `/doctor/showAppointments/:id`
**Description:** Show all appointments for a specific doctor
**Authentication:** Requires Doctor role
**Parameters:** `id` (string) - doctor ID

#### GET `/doctor/:id/freeSlots`
**Description:** Get free slots for a doctor on a specific date
**Parameters:** 
- `id` (number) - doctor ID
- `date` (query) - booking date (YYYY-MM-DD format)

#### PATCH `/doctor/updateAvailability/:id`
**Description:** Update doctor availability and reschedule affected appointments
**Authentication:** Requires Doctor role
**Parameters:** 
- `id` (number) - doctor ID
- `date` (query) - booking date
**Body:**
```json
{
  "doctor_id": "number",
  "start_time": "string",  // ISO string
  "end_time": "string",    // ISO string
  "time": "number"
}
```

#### POST `/doctor/rescheduleAffected`
**Description:** Reschedule affected appointments
**Authentication:** Requires Doctor role
**Query Parameters:**
- `date` (string) - booking date
- `id` (number) - doctor ID
- `status` (string) - appointment status

#### POST `/doctor/sendEmail`
**Description:** Send emails to patients for confirmed/rescheduled appointments
**Authentication:** Requires Doctor role
**Query Parameters:**
- `id` (string) - doctor ID
- `date` (string) - booking date

---

### 📅 Appointment Management (`/appointment`)

#### POST `/appointment/bookAppointment/:doctorId`
**Description:** Book an appointment with a doctor
**Authentication:** Requires Patient role
**Parameters:** `doctorId` (number) - doctor ID
**Body:**
```json
{
  "bookingDate": "string",           // ISO 8601 format: YYYY-MM-DD
  "bookingTime": "string",           // optional, Format: HH:MM
  "consultingday": "ConsultingDay"   // enum: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
}
```

#### GET `/appointment`
**Description:** Get all appointments

#### DELETE `/appointment/:doctorId/:appointmentId`
**Description:** Delete an appointment
**Authentication:** Requires Patient role
**Parameters:** 
- `doctorId` (number) - doctor ID
- `appointmentId` (number) - appointment ID
**Query Parameters:**
- `date` (string) - booking date

---

### 🏠 Health Check (`/`)

#### GET `/`
**Description:** Health check endpoint
**Response:** "Hello World!"

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd schedula
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure database**
Update the database configuration in `db.config.ts` with your PostgreSQL credentials.

4. **Run the application**
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Data Models

### ConsultingDay Enum
```typescript
enum ConsultingDay {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday', 
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}
```

### AppointmentStatus Enum
```typescript
enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled'
}
```

### SchedulingStrategy Enum
```typescript
enum SchedulingStrategy {
  STREAM = 'stream',
  WAVE = 'wave',
  NONE = 'none'
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **Password Hashing**: Bcrypt encryption
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: TypeORM parameterized queries
- **CORS Support**: Configurable cross-origin resource sharing

## 🌟 Why Schedula?

1. **Intelligent Scheduling**: Advanced algorithms for optimal appointment management
2. **Healthcare-Focused**: Built specifically for healthcare industry needs
3. **Scalable Architecture**: Designed to handle high-volume appointment systems
4. **User-Friendly**: Intuitive API design with comprehensive documentation
5. **Production-Ready**: Enterprise-grade security and reliability features
6. **Extensible**: Modular design for easy feature additions
7. **Time-Aware**: Sophisticated timezone handling for global deployments

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using NestJS and TypeScript**
