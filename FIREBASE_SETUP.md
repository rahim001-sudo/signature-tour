# Firebase Setup Instructions for Signature Tours & Travels

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `signature-tours-travels`
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location close to your users

## Step 3: Get Firebase Config

1. Click on the gear icon (Project Settings)
2. Scroll down to "Your apps" section
3. Click on "Web" icon to add a web app
4. Register your app with name: `signature-tours-travels-web`
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

Replace the placeholder values in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Firestore Security Rules

Update your Firestore security rules to allow writes to the enquiries collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow writes to enquiries collection
    match /enquiries/{document} {
      allow create: if true;
    }
  }
}
```

## Step 6: Test the Form

1. Start your development server: `npm start`
2. Fill out and submit the enquiry form
3. Check your Firestore database to see the submitted data

## Form Data Structure

Each enquiry will be stored with the following structure:
```javascript
{
  name: "Customer Name",
  email: "customer@email.com", 
  phone: "Phone Number",
  service: "Selected Service",
  message: "Customer Message",
  timestamp: Firebase Server Timestamp,
  status: "new"
}
```

## Next Steps

- Set up Firebase Authentication if needed
- Add email notifications using Firebase Functions
- Create an admin panel to manage enquiries
- Set up proper security rules for production