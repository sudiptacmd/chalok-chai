# ChalokChai Authentication Setup

This document provides complete setup instructions for the ChalokChai authentication system.

## Environment Setup

Make sure your `.env.local` file contains all the required environment variables:

```bash
# MongoDB
MONGO_URI="mongodb://localhost:27017/chalokchai"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Nodemailer (SMTP)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
EMAIL_FROM="your-sender-email@domain.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Features Implemented

### 1. Authentication System
- **NextAuth.js** integration with credentials provider
- **JWT-based** sessions
- **Email verification** required for all users
- **Password reset** functionality
- **Role-based authentication** (admin, driver, owner)

### 2. User Management
- **Three user types**:
  - `admin`: Can access admin panel, approve drivers
  - `driver`: Professional drivers (requires admin approval)
  - `owner`: Car owners looking for drivers

### 3. Database Models
- **User Schema**: Basic user information
- **Owner Schema**: Booking history, ratings
- **Driver Schema**: Detailed driver information, approval status

### 4. Route Protection
- **Middleware-based** route protection
- **Role-specific** redirects:
  - Admin → `/admin`
  - Driver → `/driver-dashboard` 
  - Owner → `/dashboard`

### 5. Email System
- **Email verification** after signup
- **Password reset** emails
- **Driver approval** notifications

### 6. File Uploads
- **Cloudinary** integration for image uploads
- **Automatic compression** and optimization
- **Profile photos** and **license photos** support

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Admin User (First Time Only)
Use the admin seed API to create the first admin user:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"adminSecret": "chalokchai-admin-seed-2025"}'
```

This will create an admin user with:
- Email: `admin@chalokchai.com`
- Password: `admin123456`

### 3. Start Development Server
```bash
npm run dev
```

## User Flow

### Owner Registration
1. User selects "I need a driver" on signup page
2. Fills basic information (name, email, phone, password)
3. Receives email verification
4. After email verification, can access dashboard and find drivers

### Driver Registration
1. User selects "I want to drive" on signup page
2. Fills detailed information including:
   - Personal details
   - National ID
   - Driving license number
   - Location, bio
   - Profile photo (optional)
   - License photo (optional)
3. Receives email verification
4. After email verification, account is still pending admin approval
5. Admin approves from admin panel
6. Driver receives approval email and can access driver dashboard

### Admin Access
1. Admin signs in with credentials
2. Can access admin panel at `/admin`
3. Can view and approve pending driver applications

## Route Access Control

| Route | Admin | Driver | Owner | Unauthenticated |
|-------|-------|--------|-------|-----------------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/signin` | Redirect to /admin | Redirect to /driver-dashboard | Redirect to /dashboard | ✅ |
| `/signup` | Redirect to /admin | Redirect to /driver-dashboard | Redirect to /dashboard | ✅ |
| `/admin` | ✅ | Redirect to /dashboard | Redirect to /dashboard | Redirect to /signin |
| `/driver-dashboard` | Redirect to /dashboard | ✅ | Redirect to /dashboard | Redirect to /signin |
| `/dashboard` | ✅ | Redirect to /driver-dashboard | ✅ | Redirect to /signin |
| `/find-driver` | ✅ | Redirect to /driver-dashboard | ✅ | Redirect to /signin |

## API Endpoints

### Authentication
- `POST /api/auth/signup/owner` - Owner registration
- `POST /api/auth/signup/driver` - Driver registration
- `GET /api/auth/verify-email?token=xxx` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Admin
- `GET /api/admin/drivers` - Get pending driver applications
- `PATCH /api/admin/drivers` - Approve/reject driver applications
- `POST /api/admin/seed` - Create first admin user

### File Upload
- `POST /api/upload` - Upload images to Cloudinary

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  type: String (admin|driver|owner),
  emailVerified: Boolean,
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profilePhoto: String (Cloudinary URL)
}
```

### Driver Collection
```javascript
{
  userId: ObjectId (ref: User),
  nationalId: String (unique),
  drivingLicenseNumber: String (unique),
  drivingLicensePhoto: String (Cloudinary URL),
  location: String,
  bio: String,
  dateOfBirth: Date,
  approved: Boolean,
  ratings: [RatingSchema],
  averageRating: Number,
  totalRides: Number
}
```

### Owner Collection
```javascript
{
  userId: ObjectId (ref: User),
  bookingHistory: [BookingSchema],
  ratings: [RatingSchema]
}
```

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Tokens**: Secure token generation for email verification and password reset
3. **Input Validation**: Comprehensive validation on all forms
4. **File Upload Security**: Type and size validation
5. **Route Protection**: Middleware-based authentication
6. **Email Verification**: Required for all users
7. **Admin Approval**: Required for drivers

## Troubleshooting

### Email Not Sending
- Check SMTP credentials in `.env.local`
- Verify SMTP server settings
- Check spam folder

### Database Connection Issues
- Ensure MongoDB is running
- Verify `MONGO_URI` in `.env.local`

### Cloudinary Upload Fails
- Check Cloudinary credentials
- Verify file size and type limits

### Authentication Issues
- Clear browser cookies/localStorage
- Check `NEXTAUTH_SECRET` is set
- Verify middleware configuration

## Next Steps

After completing the authentication setup, you can:

1. Implement booking system
2. Add payment integration  
3. Create rating and review system
4. Add real-time notifications
5. Implement driver availability tracking

For any issues, check the console logs for detailed error messages.
