# Backend Setup Instructions

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

### Required Variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (Reservations & Reports)
MONGO_URI=mongodb://localhost:27017/laboratorio

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=your-refresh-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=30d

# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-firebase-project-id

# Backblaze B2
B2_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_app_key
B2_BUCKET_ID=your_bucket_id
B2_BUCKET_NAME=your_bucket_name

# CORS
CORS_ORIGIN=http://localhost:5173

# Cookies
COOKIE_SECURE=false  # Set to true in production with HTTPS
```

## 3. Firebase Setup

### Download Service Account Key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in the `backend` directory

### Alternative (Environment Variable):

Instead of downloading the file, you can set the entire JSON as an environment variable:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

## 4. Initialize Firestore

Run the initialization script to create time slots:

```bash
npm run init-firestore
```

This will:
- Create 5 time slots: 7-9, 9-11, 11-13, 14-16, 16-18
- Set up initial Firestore structure

## 5. Create Firestore Indexes

In the Firebase Console, go to **Firestore Database** → **Indexes** and create composite indexes:

1. **auditLogs** collection:
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **notifications** collection:
   - Fields: `userId` (Ascending), `read` (Ascending), `created At` (Descending)

Or use the Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

## 6. Backblaze B2 Setup

1. Create a [Backblaze B2 account](https://www.backblaze.com/b2/sign-up.html)
2. Create a new bucket for lab report attachments
3. Generate an application key with read/write permissions
4. Copy the credentials to `.env`

## 7. Start Development Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Test Authentication

### Email/Password Login:
```bash
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword123",
  "nombre": "Test Student"
}
```

### Firebase SSO Login:
```bash
POST http://localhost:5000/auth/firebase
Content-Type: application/json

{
  "idToken": "Firebase_ID_Token_Here"
}
```

### Refresh Token:
```bash
POST http://localhost:5000/auth/refresh
Cookie: refreshToken=your_refresh_token_here
```

## Troubleshooting

### "Firebase credentials not configured"
- Make sure `GOOGLE_APPLICATION_CREDENTIALS` points to your service account JSON file
- Or set `FIREBASE_SERVICE_ACCOUNT` environment variable

### "MongoDB connection failed"
- Ensure MongoDB is running locally: `mongod`
- Or update `MONGO_URI` to point to your MongoDB instance

### "Cookie not set"
- Check that `credentials: true` is set in CORS configuration
- Frontend must send requests with `credentials: 'include'`

## Next Steps

1. Create admin user manually in Firestore (set `role: 'admin'`)
2. Configure frontend environment variables
3. Set up Backblaze B2 for file uploads
4. Deploy to production with proper HTTPS and `COOKIE_SECURE=true`
