# Thrift Haven - E-commerce Platform

A modern, full-stack e-commerce platform for thrift clothing built with Next.js, TypeScript, and PostgreSQL.

## Features

- **User Authentication**: NextAuth.js with Google OAuth and credentials
- **Product Catalog**: Advanced search, filtering, and sorting
- **Shopping Cart**: Real-time cart management with Zustand
- **Multi-step Checkout**: Secure payment processing with Midtrans
- **User Dashboard**: Profile management, addresses, order history
- **Admin Panel**: Product and order management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Payment**: Midtrans (Sandbox)
- **Deployment**: Vercel

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/thrift_haven"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Midtrans
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thrift-haven
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # (Optional) Seed database
   npx prisma db seed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Database Setup

### Using Neon.tech (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Using Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string to `DATABASE_URL`

## Payment Setup (Midtrans)

1. Create account at [midtrans.com](https://midtrans.com)
2. Go to Settings > Access Keys
3. Copy Server Key and Client Key
4. Set `MIDTRANS_IS_PRODUCTION=false` for sandbox

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables in Vercel**
   Add all variables from `.env.local` to Vercel's environment variables section.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── checkout/          # Checkout process
│   ├── dashboard/         # User dashboard
│   └── products/          # Product catalog
├── components/            # Reusable components
│   ├── cart/              # Shopping cart
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── lib/                   # Utilities
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Key Features Explained

### Authentication
- Email/password registration and login
- Google OAuth integration
- Protected routes for dashboard and admin
- Role-based access control

### Product Management
- CRUD operations for products
- Image upload support
- Category and size filtering
- Stock management
- Search functionality

### Shopping Cart
- Persistent cart with localStorage
- Real-time updates
- Stock validation
- Mobile-responsive design

### Checkout Process
1. **Address Selection**: Choose or add shipping address
2. **Order Review**: Confirm items and total
3. **Payment**: Secure payment with Midtrans
4. **Confirmation**: Order tracking and history

### Admin Dashboard
- Sales analytics
- Product inventory management
- Order management
- User management
- Low stock alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@thrifthaven.com or create an issue on GitHub.
