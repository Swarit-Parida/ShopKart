# 🛒 ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application that allows users to browse products, manage their cart and wishlist, authenticate securely, and complete checkout using Razorpay Test Mode.

## 🌐 Live Demo

- **Frontend:** https://shopkart-swarit.netlify.app/
- **Backend API:** https://shopkart-api-jobd.onrender.com
- **Backend Health Check:** https://shopkart-api-jobd.onrender.com/health

## ✨ Features

- **User Authentication:** Customer registration, login, logout, and protected routes.
- **Product Catalog:** Browse products and view individual product details.
- **Shopping Cart:** Add products, manage quantities, and review cart items.
- **Wishlist:** Save favorite products and remove them whenever needed.
- **Checkout:** Enter shipping details and review orders before payment.
- **Payment Integration:** Razorpay Test Mode integration with server-side payment verification.
- **Order Management:** Create orders, preserve product price snapshots, and view order history.
- **Protected APIs:** Authenticate users before accessing personal cart, wishlist, and order data.
- **Persistent Storage:** MongoDB database integration using Mongoose.
- **Responsive Interface:** React-based frontend for interacting with the store.

## 🧰 Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML5 and CSS3
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Cookie-based authentication
- Razorpay payment integration

### Deployment
- Netlify — frontend hosting
- Render — backend hosting
- MongoDB Atlas — database hosting

## 📁 Project Structure

```text
ShopKart-Submission/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── .gitignore
├── .gitignore
└── README.md
```

## ⚙️ Run Locally

### Prerequisites

Install the following before starting:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Razorpay test account for testing payments

### 1. Clone the repository

```bash
git clone https://github.com/Swarit-Parida/ShopKart.git
cd ShopKart
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Start the backend:

```bash
npm start
```

The backend should run at `http://localhost:3000`.

### 3. Configure the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local frontend URL, normally `http://localhost:5173`.

## 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Runtime environment |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `CLIENT_URL` | Allowed frontend origin for production CORS |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `VITE_API_URL` | Backend API base URL used by the frontend |

**Security:** Never commit real `.env` files, database credentials, JWT secrets, or Razorpay secrets to GitHub. Configure production secrets through the respective hosting platform's environment variable settings.

## 💳 Payment Testing

ShopKart integrates Razorpay in Test Mode.

- Use Razorpay's supported test payment credentials and methods.
- Payment orders are created by the backend.
- Payment signatures are verified on the server.
- The application should update order and payment status only after successful verification.
- Do not use real payment credentials in the public repository.

## 🚀 Deployment

### Frontend — Netlify

1. Connect the GitHub repository to Netlify.
2. Set the base directory to `frontend`.
3. Set the build command to `npm run build`.
4. Set the publish directory to `dist`.
5. Configure `VITE_API_URL` with the deployed Render backend URL.
6. Deploy the site.

### Backend — Render

1. Create a Web Service linked to the GitHub repository.
2. Set the root directory to `backend`.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Configure the backend environment variables.
6. Deploy the service.

### Database — MongoDB Atlas

Configure the `MONGO_URI` environment variable with your database connection string. Ensure the database network access rules permit connections from the deployed backend.

## 🛡️ Security Practices

- Passwords are hashed before storage.
- Protected routes verify authentication tokens.
- Personal resources are associated with the authenticated user.
- Payment signatures are verified on the backend.
- Sensitive configuration is stored in environment variables.
- Production frontend and backend origins are configured for cross-origin requests with credentials.

## 👨‍💻 Author

**Swarit Parida**

GitHub: [Swarit-Parida](https://github.com/Swarit-Parida)

---

Built as a full-stack e-commerce project to practice frontend development, backend API design, authentication, database integration, and payment processing.
