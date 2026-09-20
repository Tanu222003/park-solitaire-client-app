# Park Solitaire - Google Play Console Deployment Guide (.aab)

This document provides complete instructions for uploading and publishing the **Park Solitaire** Android App Bundle (`.aab` file) to the **Google Play Console**.

---

## 1. Generated Files Summary

| Resource | Path | Description |
| :--- | :--- | :--- |
| **Android App Bundle (.aab)** | `release-bundle/park-solitaire-v1.0.0.aab` | **Upload this file to Google Play Console** (Size: ~3.5 MB). |
| **Release Keystore (.jks)** | `park-solitaire-frontend/android/app/parksolitaire-release-key.jks` | Cryptographic signature key used to sign the bundle. |
| **1-Click Build Script** | `build-aab.sh` | Shell script to recompile web assets and build a new `.aab` anytime. |
| **Android Native Project** | `park-solitaire-frontend/android/` | Full native Android Studio project folder. |

---

## 2. Release Signing Credentials

> [!IMPORTANT]
> Keep your keystore credentials safe. Google Play requires all updates to use the same signing key (or Google Play App Signing).

- **Keystore File**: `park-solitaire-frontend/android/app/parksolitaire-release-key.jks`
- **Key Alias**: `parksolitaire`
- **Keystore Password**: `ParkSolitaire2026!`
- **Key Password**: `ParkSolitaire2026!`
- **Key Algorithm**: `RSA 2048-bit`
- **Validity**: `10,000 days`
- **Certificate Owner**: `CN=Park Solitaire Lifespaces, OU=Mobile CRM, O=Park Solitaire, L=Mumbai, ST=Maharashtra, C=IN`

---

## 3. Step-by-Step: Uploading to Google Play Console

### Step 1: Open Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create app** (top-right corner).
3. Fill in basic details:
   - **App name**: `Park Solitaire`
   - **Default language**: `English (United States)` or `English (India)`
   - **App or game**: `App`
   - **Free or paid**: `Free`
   - Accept the declarations and click **Create app**.

---

### Step 2: Create a Release & Upload `.aab`
1. On the left sidebar, navigate to:
   - **Testing -> Internal testing** (Recommended first for testing on real devices), **OR**
   - **Release -> Production** (To release directly to the public store).
2. Click **Create new release** (top-right).
3. Under **App bundles**, drag & drop or browse:
   ```
   /Users/tanishasureshparmar/Downloads/ps/release-bundle/park-solitaire-v1.0.0.aab
   ```
4. **Release name**: Enter `1.0.0 (1)`.
5. **Release notes**: e.g.,
   ```
   Initial release of Park Solitaire Real Estate CRM for Channel Partners & Administrators.
   - Lead management & dossier tracking
   - Today & tomorrow client visit scheduling
   - Real-time client enquiry and payment status tracking
   ```
6. Click **Next** / **Save**.

---

### Step 3: Complete Mandatory Store Requirements

Google Play requires completing the **Dashboard tasks** before releasing:

1. **App Access**: Select *"All functionality is available without special access"* or provide demo credentials:
   - Partner Demo: `partner@parksolitaire.com` / `partner123`
   - Admin Demo: `admin@parksolitaire.com` / `admin123`
2. **Ads**: Select *"No, my app does not contain ads"*.
3. **Content Rating**: Start questionnaire -> Select *Utility / Productivity / CRM* -> All answers "No" -> Save rating.
4. **Target Audience**: Select *18 and above*.
5. **News / Financial / Government Apps**: Select *"No"*.
6. **Data Safety**:
   - Data collection: Name, Phone number, Email (for CRM account & lead management).
   - Encryption in transit: Yes (HTTPS).
7. **Privacy Policy**: Enter your hosted privacy policy URL.

---

### Step 4: Main Store Listing
Under **Grow -> Store presence -> Main store listing**:
1. **Short description** (up to 80 chars):
   `Luxury Real Estate CRM & Channel Partner Portal for Park Solitaire Lifespaces.`
2. **Full description** (up to 4000 chars):
   `Park Solitaire is the official Channel Partner and Administrator application for Park Solitaire Lifespaces LLP. Manage client enquiries, track unit preferences, schedule site visits for today and tomorrow, manage complaints, and monitor payment statuses with seamless real-time synchronization.`
3. **App icon**: 512 x 512 px PNG (located in `park-solitaire-frontend/public/logo.png`).
4. **Feature graphic**: 1024 x 500 px banner.
5. **Phone screenshots**: Add 2-8 screenshots (use Figma screens or screenshots from Chrome emulator).

---

### Step 5: Review & Roll Out
1. Go back to your release (Internal Testing or Production).
2. Click **Review release**.
3. Review any warnings (if all green, you're ready).
4. Click **Start rollout**!

---

## 4. How to Re-Build Future Updates

Whenever you make code changes in React and want to generate a new `.aab` file:

```bash
cd /Users/tanishasureshparmar/Downloads/ps
./build-aab.sh
```

The script will automatically compile Vite, sync Capacitor assets, run Gradle, and output the new bundle to `release-bundle/park-solitaire-v1.0.0.aab`.
