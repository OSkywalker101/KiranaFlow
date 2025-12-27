# SESSION-BASED OTP LOGIN SETUP GUIDE

## 🎯 Overview
Your session-based OTP login flow is now implemented with:
- ✅ Email input on login page
- ✅ OTP generation and email sending via Supabase
- ✅ OTP verification page
- ✅ Session creation on successful verification
- ✅ Protected routes (middleware)
- ✅ Logout functionality

---

## 📋 IMPORTANT: Supabase Email Configuration

To ensure **ONLY numeric OTP codes** are sent (no magic links), you need to configure your Supabase project:

### Step 1: Access Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: `phuhjlsonmuylaphrvvz`

### Step 2: Configure Email Templates
1. Navigate to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Replace the entire template with this OTP-only version:

```html
<h2>Your One-Time Password</h2>
<p>Your verification code is:</p>
<h1 style="font-size: 32px; font-weight: bold; margin: 20px 0;">{{ .Token }}</h1>
<p>This code will expire in 60 minutes.</p>
<p>If you didn't request this code, you can safely ignore this email.</p>
```

### Step 3: Configure Auth Settings
1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - ✅ Enable Email Provider
   - ✅ Confirm Email: Toggle **ON** (recommended for production)
   - ⚙️ Secure Email Change: Toggle **ON** (recommended)

3. Under **Email Rate Limits**:
   - Set appropriate limits to prevent abuse (e.g., 3 OTP requests per hour per email)

### Step 4: Test Email Configuration
1. Navigate to **Authentication** → **Settings** → **SMTP Settings**
2. Verify your email provider is configured (Supabase uses its own by default for development)
3. For production, consider setting up custom SMTP (Gmail, SendGrid, etc.)

---

## 🔧 Backend Configuration (Already Set Up)

Your backend is configured in `Backend/.env`:
```env
SUPABASE_URL=https://phuhjlsonmuylaphrvvz.supabase.co
SUPABASE_KEY=eyJhbGci...
```

---

## 🎨 Frontend Configuration (Already Set Up)

Your frontend is configured in `Frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://phuhjlsonmuylaphrvvz.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGci...
```

---

## 🚀 How to Use the Login Flow

### 1. User Login
- Navigate to `/login`
- Enter email address
- Click "Send OTP"
- System sends 6-digit OTP to email

### 2. OTP Verification
- User is redirected to `/verify?email=user@example.com`
- Enter the 6-digit code from email
- Click "Verify"

### 3. Session Created
- On successful verification, user is logged in
- Session is stored in Supabase Auth
- User is redirected to home page `/`
- Session persists across page refreshes

### 4. Protected Routes
All routes except `/login` and `/verify` are protected by middleware
- Unauthenticated users are redirected to `/login`
- Authenticated users cannot access `/login` (redirected to `/`)

### 5. Logout
- Click "Logout" button in the navbar
- Session is cleared
- User is redirected to `/login`

---

## 📁 File Structure

```
Frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page (email input)
│   │   ├── verify/
│   │   │   └── page.tsx          # OTP verification page
│   │   └── layout.tsx            # Root layout with Navbar
│   ├── components/
│   │   └── layout/
│   │       └── Navbar.tsx        # Navigation with logout
│   ├── lib/
│   │   └── supabaseClient.ts    # Supabase client initialization
│   ├── store/
│   │   └── authStore.ts         # Zustand auth state management
│   └── middleware.ts             # Route protection middleware
└── .env.local                    # Environment variables

Backend/
├── main.py                       # FastAPI backend
├── database.py                   # Supabase connection
└── .env                          # Backend environment variables
```

---

## 🔐 Security Features

### 1. Session Management
- Uses Supabase Auth built-in session handling
- Sessions are stored as HTTP-only cookies
- Automatic session refresh

### 2. OTP Security
- 6-digit numeric code
- 60-minute expiration
- Single use (cannot be reused)
- Rate limiting (configure in Supabase)

### 3. Route Protection
- Middleware checks authentication status
- Redirects unauthenticated users to login
- Prevents access to login page when authenticated

### 4. State Management
- Auth state managed by Zustand
- Automatic session sync across tabs
- Listens to auth state changes via `onAuthStateChange`

---

## 🧪 Testing the Flow

### Test Scenario 1: New User Login
1. Clear browser cookies/storage
2. Navigate to `http://localhost:3000`
3. Should redirect to `/login`
4. Enter email and click "Send OTP"
5. Check email for 6-digit code
6. Enter code on `/verify` page
7. Should redirect to home page with navbar showing email

### Test Scenario 2: Logout
1. While logged in, click "Logout" in navbar
2. Should redirect to `/login`
3. Try accessing `http://localhost:3000`
4. Should redirect to `/login`

### Test Scenario 3: Session Persistence
1. Log in successfully
2. Refresh the page
3. Should remain logged in
4. Open app in new tab
5. Should be logged in there too

---

## 🐛 Troubleshooting

### Issue: OTP Email Not Received
**Solutions:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase Email Rate Limits
4. Verify SMTP configuration in Supabase Dashboard
5. Check Supabase logs: Dashboard → Logs → Auth Logs

### Issue: "Invalid OTP" Error
**Solutions:**
1. Ensure OTP is entered correctly (no spaces)
2. Check if OTP has expired (60-minute limit)
3. Request a new OTP
4. Verify email matches the one used to request OTP

### Issue: Redirected to Login After Refresh
**Solutions:**
1. Check browser console for errors
2. Verify `.env.local` exists with correct values
3. Clear browser cache and cookies
4. Check if Supabase URL and Key are correct
5. Verify middleware is working: check `src/middleware.ts`

### Issue: Email Shows Magic Link Instead of OTP
**Solutions:**
1. Update Supabase Email Template (see Step 2 above)
2. Clear Supabase email cache
3. Request new OTP to test

---

## 🔄 How It Works (Technical Flow)

### Login Flow (Detailed)
```
1. User enters email on /login
   ↓
2. Frontend calls: supabase.auth.signInWithOtp({ email })
   ↓
3. Supabase generates 6-digit OTP
   ↓
4. Supabase sends OTP via email using configured template
   ↓
5. User redirected to /verify?email=user@example.com
   ↓
6. User enters OTP
   ↓
7. Frontend calls: supabase.auth.verifyOtp({ email, token, type: 'email' })
   ↓
8. If valid:
   - Supabase creates session
   - Session stored in cookies
   - authStore updated via onAuthStateChange listener
   - User redirected to /
   ↓
9. Middleware checks session on every navigation
   ↓
10. User can access protected routes while session is valid
```

### Session Lifecycle
```
Login → Session Created → Stored in Cookies → Auto-Refresh → Logout → Session Cleared
```

---

## 🎯 Next Steps

### For Production
1. ✅ Set up custom SMTP in Supabase (Gmail, SendGrid, etc.)
2. ✅ Enable email confirmation for new users
3. ✅ Add rate limiting for OTP requests
4. ✅ Add reCAPTCHA to prevent bot abuse
5. ✅ Set up error monitoring (Sentry, LogRocket, etc.)
6. ✅ Add analytics to track login success/failure rates

### Optional Enhancements
- Add "Resend OTP" functionality
- Add loading states and better error messages
- Add toast notifications instead of alerts
- Add email validation on frontend
- Add OTP auto-fill detection
- Add "Remember me" functionality
- Add 2FA (TOTP) for additional security

---

## 📞 Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Review Supabase Auth Logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

## ✅ Current Status

- ✅ Frontend `.env.local` created
- ✅ Login page implemented
- ✅ Verify page implemented
- ✅ Auth store configured
- ✅ Middleware for route protection
- ✅ Navbar with logout functionality
- ⚠️ **REQUIRED**: Update Supabase email template (see Step 2)

---

## 🎉 You're All Set!

Your session-based OTP login flow is ready to use. Just complete the Supabase email template configuration and you're good to go!

**To start testing:**
```bash
# Frontend (already running)
cd Frontend
npm run dev

# Backend (if needed)
cd Backend
uvicorn main:app --reload
```

Navigate to `http://localhost:3000` and test the login flow! 🚀
