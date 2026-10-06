# Google OAuth Setup Guide for Streamify

## Quick Setup Steps

### 1. Get Your Google OAuth Client ID

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "Streamify")

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen:
     - User Type: External (for testing) or Internal (for organization)
     - App name: Streamify
     - User support email: your email
     - Developer contact: your email
     - Click "Save and Continue" through the steps
   
5. **Create OAuth Client ID**
   - Application type: **Web application**
   - Name: Streamify Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for development)
     - `http://localhost:3001` (if using different port)
     - `https://yourdomain.com` (for production - add this later)
   - **Authorized redirect URIs:**
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Click "Create"

6. **Copy Your Client ID**
   - You'll see a popup with your Client ID
   - It looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - Copy this value

### 2. Configure Frontend

1. **Create `.env` file** in the `frontend` directory:
   ```bash
   cd frontend
   ```

2. **Add your Client ID** to `.env`:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```
   Replace with your actual Client ID!

3. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm start
   ```

### 3. Test Google Sign-In

1. Navigate to `http://localhost:3000/auth`
2. Click "Continue with Google"
3. Select your Google account
4. You should be automatically signed in!

## Troubleshooting

### Error: "Google OAuth is not configured"
- ✅ Make sure `.env` file exists in the `frontend` directory
- ✅ Make sure the variable name is exactly: `REACT_APP_GOOGLE_CLIENT_ID`
- ✅ Make sure you restarted the server after adding the variable
- ✅ Check that there are no spaces around the `=` sign

### Error: "redirect_uri_mismatch"
- ✅ Make sure `http://localhost:3000` is added to "Authorized JavaScript origins"
- ✅ Make sure the port matches your development server port
- ✅ Check for typos in the URL (no trailing slashes)

### Google Sign-In Popup Not Appearing
- ✅ Check browser console for errors
- ✅ Make sure Google Identity Services script is loading
- ✅ Try clearing browser cache
- ✅ Check that your Client ID is correct

### Still Having Issues?
1. Check the browser console (F12) for detailed error messages
2. Verify your Client ID in Google Cloud Console
3. Make sure the OAuth consent screen is configured
4. Ensure the API is enabled

## Production Setup

When deploying to production:

1. **Update Authorized Origins:**
   - Add your production domain to "Authorized JavaScript origins"
   - Example: `https://streamify.com`

2. **Update Environment Variables:**
   - Set `REACT_APP_GOOGLE_CLIENT_ID` in your hosting platform
   - (Vercel, Netlify, etc. have environment variable settings)

3. **HTTPS Required:**
   - Google OAuth requires HTTPS in production
   - Most hosting platforms provide this automatically

## Security Notes

- ⚠️ Never commit your `.env` file to Git
- ⚠️ The `.env` file is already in `.gitignore`
- ⚠️ Keep your Client ID secret (though it's less sensitive than Client Secret)
- ⚠️ Use different Client IDs for development and production

---

**Need Help?** Check the main `SETUP_GUIDE.md` for more information.

