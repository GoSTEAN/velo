# Velo: Next-Gen Multi-Chain Digital Wallet 🚀

Velo is an innovative digital wallet platform designed to simplify cryptocurrency payments and financial management. Built with **Next.js**, **Node.js**, and **TypeScript**, it provides a seamless experience for sending, receiving, and splitting payments across multiple blockchain networks including **Starknet**, **Ethereum**, **Solana**, and **Bitcoin**. Experience effortless fiat on/off-ramps, real-time transaction monitoring, and secure user management, all within an intuitive and responsive interface.

## ✨ Features

*   **Multi-Chain Wallet Integration**: Manage digital assets across Starknet, Ethereum, Solana, and Bitcoin with unified wallet addresses.
*   **Secure Authentication**: Robust user registration, login, and OTP verification to ensure account security.
*   **Dynamic QR Code Payments**: Generate instant, customizable QR codes for receiving crypto payments, perfect for merchants.
*   **Smart Payment Splitting**: Create and execute reusable templates for automated fund distribution to multiple recipients, streamlining group payments.
*   **Fiat On/Off-Ramp**: Seamlessly buy crypto with Nigerian Naira (NGN) via integrated payment gateways like Paystack, and withdraw funds to local bank accounts.
*   **Real-time Exchange Rates**: Stay updated with live crypto-to-NGN exchange rates fetched from reliable sources.
*   **Comprehensive Transaction History**: Keep track of all incoming, outgoing, swap, and split transactions with detailed records.
*   **Interactive Notification System**: Receive real-time alerts for deposits, transfers, and account activities, ensuring you're always informed.
*   **User Profile & KYC Management**: Personalize your profile, manage linked bank accounts, and complete identity verification for enhanced security and features.
*   **Responsive User Interface**: Enjoy a modern, adaptive, and high-performance experience across all devices, powered by Tailwind CSS and Shadcn UI.

## 🛠️ Technologies Used

| Category         | Technology    | Description                                       |
| :--------------- | :------------ | :------------------------------------------------ |
| **Frontend**     | Next.js       | React framework for full-stack applications.      |
|                  | React         | UI library for building interactive interfaces.   |
|                  | TypeScript    | Strongly typed superset of JavaScript.            |
|                  | Tailwind CSS  | Utility-first CSS framework for rapid styling.    |
|                  | Shadcn UI     | Reusable UI components built on Radix UI.         |
|                  | Framer Motion | Library for animations and gestures.              |
| **Backend**      | Node.js       | JavaScript runtime for server-side logic.         |
|                  | Next.js API Routes | Serverless functions for API endpoints.          |
|                  | jsonwebtoken  | For handling JSON Web Tokens for authentication.  |
|                  | bcryptjs      | For password hashing and security.                |
| **Blockchain**   | Starknet      | Layer 2 scaling solution for Ethereum.            |
|                  | @starknet-react/core | React hooks for Starknet dApp development.  |
|                  | Ethers.js     | Library for interacting with Ethereum blockchains.|
|                  | @solana/web3.js | Solana blockchain client library.                |
|                  | bitcoinjs-lib | Bitcoin protocol interaction library.             |
|                  | Alchemy SDK   | API for enhanced blockchain data access.          |
| **Payments**     | Paystack      | Payment gateway for Nigerian Naira transactions.  |
| **Utilities**    | qrcode        | For generating QR codes.                          |
|                  | crypto-js     | For cryptographic functions.                      |
|                  | sonner        | A modern toast library for React.                 |

## 🚀 Getting Started

Follow these steps to set up and run the Velo project locally.

### ⬇️ Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/GoSTEAN/velo.git
    cd velo
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

### ⚙️ Environment Variables

Velo requires several environment variables for proper functioning. Create a `.env.local` file in the root directory and populate it with the following:

```env
# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
STARKNET_NODE_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/[YOUR_ALCHEMY_API_KEY]
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/[YOUR_ALCHEMY_API_KEY]
NEXT_PUBLIC_MAINNET_RPC_URL=https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/[YOUR_ALCHEMY_API_KEY]
NEXT_PUBLIC_CONTRACT_ADDRESS=0x04217b882eba5144fe47179d8c618eb75f0165ca5070d5e00a6ab586d32f23e6

# Alchemy API Key (for blockchain data)
ALCHEMY_API_KEY=flnzCuWiZc_GH5uLRgwCV # Replace with your actual Alchemy API key

# Internal Payment API Keys (for backend-to-backend communication or custom services)
PAYMENT_API_KEY=mPDAKLfEbYwYoJmW3PzT98lIhkY/wbP43Ak5FunGRi0= # Replace with a strong, unique key
NEXT_PUBLIC_PAYMENT_API_KEY=mPDAKLfEbYwYoJmW3PzT98lIhkY/wbP43Ak5FunGRi0= # Same as above, for client-side access (if needed)

# Public API URL (for frontend to connect to the backend)
NEXT_PUBLIC_API_URL=http://web-node-backend.emender.com # Or your local backend URL, e.g., http://localhost:8080

# Ethereum, Polygon, Solana Node URLs (Alchemy RPCs recommended)
ETHEREUM_NODE_URL=https://eth-sepolia.g.alchemy.com/v2/[YOUR_ALCHEMY_API_KEY]
POLYGON_NODE_URL=https://polygon-mumbai.g.alchemy.com/v2/[YOUR_ALCHEMY_API_KEY]
SOLANA_NODE_URL=https://solana-devnet.g.alchemy.com/v2/[YOUR_ALCHEMY_API_KEY]

# Paystack Configuration (for fiat integration)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=sk_test_2bd21d968dececd575a9862025f6d8fcdd558d2c # Replace with your Paystack Public Key

# Backend Service URL (if backend is separate from Next.js API routes)
BACKEND_URL=https://velo-node-backend.onrender.com
ALLOWED_ORIGINS=http://localhost:3000,https://connectvelo.com # Comma-separated list of allowed origins

# Development Environment
NODE_ENV=development
```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🚀 Usage

Velo offers a robust set of features to manage your digital assets and payments. Here are some common use cases:

### 👤 User Registration & Login
Navigate to `/auth/signup` to create a new account or `/auth/login` if you already have one. The system uses email and password authentication with an OTP verification step for new registrations.

### 🌐 Connecting Wallets & Viewing Balances
After logging in, access the dashboard. Velo automatically detects and connects to your linked blockchain wallets (Starknet, Ethereum, Solana, Bitcoin) and displays your aggregated balances in Naira, along with a detailed breakdown per asset.

### 💳 Generating a QRPayment Request
1.  Go to the "QRPayment" tab in your dashboard.
2.  Select the desired cryptocurrency (e.g., USDT, STRK, ETH).
3.  Enter the amount in NGN you wish to receive.
4.  Click "Create Payment Request". A unique QR code will be generated, which you can share with payers. The system monitors the payment status in real-time.

### 🤝 Creating a Split Payment
1.  Access the "Payment Split" tab.
2.  Click "Create New Split".
3.  Provide a title and description for your split.
4.  Add recipients by entering their name, wallet address, and the amount they should receive. You can add up to 50 recipients.
5.  Select the blockchain network and your sending address.
6.  Once created, you can activate, deactivate, or execute the split, distributing funds to all recipients in a single transaction.

### 💸 Sending Funds
1.  Navigate to the "Send Funds" tab.
2.  Choose the cryptocurrency you want to send from your available Velo wallets.
3.  Enter the recipient's blockchain address. For Starknet, addresses are automatically normalized.
4.  Specify the amount to send.
5.  Review the transaction details and confirm the transfer.

### 📊 Checking Transaction History
The "History" tab provides a comprehensive overview of all your financial activities, including incoming, outgoing, swap, and split transactions, along with their status and timestamps.

### 🔔 Managing Notifications
The "Notifications" tab displays all important alerts related to your account, such as new deposits, sent tokens, and login activities. You can mark notifications as read individually or clear all.

## 🤝 Contributing

We welcome contributions to the Velo project! If you're interested in improving the platform, please follow these guidelines:

*   **Fork the repository**.
*   **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`.
*   **Make your changes**, ensuring they adhere to the project's coding standards.
*   **Write clear, concise commit messages**.
*   **Push your changes** to your forked repository.
*   **Open a Pull Request** to the `main` branch of the original repository, describing your changes in detail.

## 📜 License

This project is proprietary and all rights are reserved by the original creators.

## 🧑‍💻 Author Info

**[Your Name/Alias Here]**

*   LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile) (Placeholder)
*   Twitter: [@YourTwitterHandle](https://twitter.com/yourhandle) (Placeholder)
*   Portfolio: [Your Portfolio Website](https://yourportfolio.com) (Placeholder)

---
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)