# Video Dating App

A modern dating application featuring video reels, live streaming, and AI-powered matching.

## Features

- Video reels for swiping
- Live streaming capabilities
- Instant video calling
- AI-powered matching system
- Personalized match suggestions
- User profile management
- Real-time chat

## Tech Stack

- Next.js 14 (React Framework)
- TypeScript
- Prisma (Database ORM)
- Agora (Video SDK)
- TensorFlow.js (AI Matching)
- TailwindCSS (Styling)
- NextAuth.js (Authentication)

## Prerequisites

- Node.js 18+
- PostgreSQL
- Agora Account
- Cloudinary Account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dating_app"
   NEXTAUTH_SECRET="your-secret"
   AGORA_APP_ID="your-agora-app-id"
   AGORA_APP_CERTIFICATE="your-agora-certificate"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
4. Initialize the database:
   ```bash
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                 # Next.js app directory
├── components/         # React components
├── lib/               # Utility functions
├── prisma/            # Database schema
├── public/            # Static assets
└── styles/            # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
