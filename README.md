# Bikya Frontend - E-commerce Platform

## 📋 Project Overview

Bikya is a comprehensive e-commerce platform built with Angular 17, featuring user authentication, product management, payment processing with Stripe, order management, and admin dashboard.

## 🚀 Features

### 🔐 Authentication & User Management
- User registration and login
- Email verification
- Password reset functionality
- Role-based access control (User, Admin)
- Profile management

### 🛍️ Product Management
- Product listing with categories
- Product details with images
- Add/Edit/Delete products (for sellers)
- Product search and filtering
- Product condition badges (New/Used)
- Exchange functionality

### 💳 Payment System
- Stripe payment integration
- Secure payment processing
- Payment history tracking
- Webhook handling for payment status updates
- Multiple payment methods support

### 📦 Order Management
- Order creation and tracking
- Order status updates (Pending, Paid, Shipped, Completed, Cancelled)
- Real-time order status synchronization
- Admin order management dashboard
- Order history for users

### 🚚 Shipping & Delivery
- Shipping cost calculation
- Shipping tracking
- Admin shipping management
- Multiple shipping options

### ⭐ Reviews & Ratings
- Product reviews and ratings
- Review management system
- User feedback system

### 💰 Wallet System
- User wallet management
- Transaction history
- Balance tracking
- Payment processing

### 👨‍💼 Admin Dashboard
- User management
- Product management
- Order management with real-time updates
- Category management
- Shipping management
- Payment monitoring
- Auto-refresh functionality (30 seconds)

## 🛠️ Technology Stack

### Frontend
- **Angular 17** - Main framework
- **TypeScript** - Programming language
- **Bootstrap 5** - UI framework
- **RxJS** - Reactive programming
- **Angular Router** - Navigation
- **Angular Forms** - Form handling

### Backend Integration
- **ASP.NET Core** - Backend API
- **C#** - Backend language
- **Entity Framework** - ORM
- **SQL Server** - Database

### Payment & External Services
- **Stripe** - Payment processing
- **Stripe Webhooks** - Payment status updates
- **Stripe CLI** - Local webhook testing

## 📁 Project Structure

```
BikyaFrontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/           # Route guards
│   │   │   ├── interceptors/     # HTTP interceptors
│   │   │   ├── models/          # Data models
│   │   │   └── services/        # Core services
│   │   ├── features/
│   │   │   ├── admin/           # Admin features
│   │   │   ├── auth/            # Authentication
│   │   │   ├── orders/          # Order management
│   │   │   ├── payment/         # Payment processing
│   │   │   ├── products/        # Product management
│   │   │   ├── profile/         # User profile
│   │   │   ├── review/          # Reviews system
│   │   │   ├── shipping/        # Shipping management
│   │   │   └── wallet/          # Wallet system
│   │   └── shared/
│   │       └── components/      # Shared components
│   ├── environments/            # Environment configs
│   └── assets/                  # Static assets
├── angular.json                 # Angular config
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Angular CLI** (v17)
- **Backend API** running on `https://localhost:65162`

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BikyaFrontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create/update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:65162'
};
```

### 4. Start Development Server
```bash
ng serve --port 4201
```

The application will be available at `http://localhost:4201`

## 🔧 Configuration

### Stripe Configuration
1. Set up Stripe account and get API keys
2. Configure webhook endpoints in Stripe dashboard
3. Set webhook URL: `https://localhost:65162/api/Wallet/Payment/webhook`

### Backend API
Ensure the backend API is running on `https://localhost:65162` with the following endpoints:
- Authentication: `/api/Auth/*`
- Products: `/api/Product/*`
- Orders: `/api/Order/*`
- Payments: `/api/Wallet/Payment/*`
- Users: `/api/User/*`
- Categories: `/api/Category/*`

## 🧪 Testing

### Webhook Testing
For local webhook testing:
```bash
# Install Stripe CLI
stripe listen --forward-to https://localhost:65162/api/Wallet/Payment/webhook
```

### Payment Testing
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 📱 Key Features Implementation

### Payment Flow
1. User selects product and proceeds to checkout
2. Payment form is displayed with Stripe integration
3. User enters payment details
4. Payment is processed through Stripe
5. Webhook updates order status automatically
6. Admin dashboard reflects changes in real-time

### Order Management Flow
1. Admin can view all orders in dashboard
2. Orders auto-refresh every 30 seconds
3. Admin can manually update order status
4. Changes are saved to database
5. Real-time updates across the system

### Webhook Integration
- **Stripe Webhook Service**: Handles payment events
- **Order Status Updates**: Automatic status changes on payment
- **Admin Dashboard**: Real-time order status synchronization
- **Database Integration**: Persistent order status changes

## 🔒 Security Features

- JWT token authentication
- Route guards for protected routes
- HTTP interceptors for token management
- Secure payment processing with Stripe
- Webhook signature verification
- Role-based access control

## 📊 Admin Features

### Dashboard Capabilities
- **User Management**: View and manage all users
- **Product Management**: Approve, edit, delete products
- **Order Management**: Track and update order status
- **Category Management**: Manage product categories
- **Payment Monitoring**: Track payment status
- **Shipping Management**: Manage shipping options

### Real-time Updates
- Auto-refresh every 30 seconds
- Manual refresh button
- Real-time order status changes
- Payment status synchronization

## 🚀 Deployment

### Production Build
```bash
ng build --configuration production
```

### Environment Variables
Set production environment variables:
- API URL
- Stripe public key
- Webhook endpoints

### Server Requirements
- Node.js server or static file hosting
- HTTPS enabled for Stripe webhooks
- CORS configuration for API access

## 🔧 Troubleshooting

### Common Issues

1. **Payment Not Processing**
   - Check Stripe API keys
   - Verify webhook endpoints
   - Check browser console for errors

2. **Order Status Not Updating**
   - Ensure backend is running
   - Check webhook configuration
   - Verify database connectivity

3. **Admin Dashboard Not Loading**
   - Check authentication
   - Verify admin role permissions
   - Check API connectivity

### Debug Mode
Enable debug logging in browser console:
```typescript
// In environment.ts
export const environment = {
  production: false,
  debug: true,
  apiUrl: 'https://localhost:65162'
};
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/Auth/register` - User registration
- `POST /api/Auth/login` - User login
- `POST /api/Auth/forgot-password` - Password reset
- `POST /api/Auth/verify-email` - Email verification

### Product Endpoints
- `GET /api/Product/all` - Get all products
- `POST /api/Product/add` - Add new product
- `PUT /api/Product/{id}` - Update product
- `DELETE /api/Product/{id}` - Delete product

### Order Endpoints
- `GET /api/Order/all` - Get all orders (admin)
- `POST /api/Order` - Create new order
- `PUT /api/Order/status` - Update order status
- `GET /api/Order/{id}` - Get order details

### Payment Endpoints
- `POST /api/Wallet/Payment/create-payment-intent` - Create payment
- `POST /api/Wallet/Payment/webhook` - Stripe webhook
- `GET /api/Wallet/Payment/history` - Payment history

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Bikya Frontend** - Built with ❤️ using Angular 17
