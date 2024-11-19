# QR Møllebakken Art Project

A digital art gallery platform for Møllebakken school, allowing teachers to upload student artwork and parents to view their children's creations through QR codes.

## Features

- Teacher dashboard for uploading student artwork
- Support for images, videos (max 20s), and audio recordings (max 1min)
- QR code-based parent access
- Offline support
- Responsive design

## Tech Stack

- React
- TypeScript
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- Vite

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/uset82/qr-mollebakken.git
cd qr-mollebakken
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

## Storage Quotas

Each student has the following storage limits:
- Images: Maximum 3 images
- Videos: Maximum 1 video (20 seconds, 50MB limit)
- Audio: Maximum 1 audio recording (1 minute, 10MB limit)

## License

MIT