# Infolock Digital Vault

**InfoLock** is a **secure digital vault application** designed to store and manage sensitive information with advanced security measures and a user-friendly interface.

## Features

- **User Authentication**: Secure login system with password hashing (bcrypt) and peppering.
- **Two-Factor Authentication (2FA)**: Email-based OTP verification for enhanced security.
- **reCAPTCHA Integration**: Protects against bot attacks during login attempts.
- **Secure Storage**: Sensitive data is encrypted before being stored in the database.
- **Responsive Design**: User-friendly interface optimized for both desktop and mobile devices.
- **Role-Based Access Control (RBAC)**: Administrative and user-level access segregation.

---

## Technologies Used

### Backend:
- **Node.js**: Backend framework for server-side logic.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: Database for storing user data securely.
- **SendGrid**: Service for sending OTPs via email.

### Frontend:
- **React.js**: UI library for building the user interface.
- **React Router**: For managing client-side navigation.
- **Tailwind CSS**: Utility-first CSS framework for styling.

### Security:
- **bcrypt**: For hashing and securely storing user passwords.
- **Password Peppering**: Added layer of security to password hashes.
- **reCAPTCHA**: To prevent automated bot attacks.
- **Email-Based OTP**: For two-factor authentication during login.

---

## Installation and Setup

### Prerequisites
- **Node.js**: Install [Node.js](https://nodejs.org/).
- **MongoDB**: Set up MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/atlas).
- **Environment Variables**: Create a `.env` file with the necessary values

### Steps
1. Clone the repository:
 ```bash
 git clone https://github.com/YourUsername/DigitalVault.git
 cd DigitalVault
```
2. Install dependencies for both backend and frontend:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```
3. Start the application:
```bash
# Backend
cd backend
npm start

# Frontend
cd ../frontend
npm start
```
Access the application at http://localhost:3000.

---

## Usage
1. **Sign Up**: Create an account with a secure password.
2. **Login**: Log in using your credentials.
3. **2FA Verification**: Enter the OTP sent to your registered email to access the vault.
4. **Manage Sensitive Data**: Add, view, or delete your sensitive information securely.

---

## Security Features
- **reCAPTCHA Integration**: Prevents bots from brute-forcing credentials.
- **Password Hashing**: Ensures that passwords are stored securely.
- **Email-Based 2FA**: Adds an extra layer of security during login.
- **Encrypted Storage**: Protects sensitive information within the vault.

---

## License
This project is licensed under the MIT License.
