# Hospital Management System

A modern web-based Hospital Management System built with React.js and Node.js. This system helps hospitals manage their day-to-day operations efficiently, including patient appointments, doctor schedules, and administrative tasks.

## Features

- **Multi-User System**
  - Admin Dashboard
  - Doctor Dashboard
  - Patient Dashboard

- **Admin Features**
  - Manage Doctors
  - Manage Patients
  - View Statistics
  - Monitor Appointments

- **Doctor Features**
  - View Appointments
  - Manage Patient Records
  - Update Medical History
  - Track Patient Progress

- **Patient Features**
  - Book Appointments
  - View Medical History
  - Provide Feedback
  - View/Pay Bills

## Tech Stack

- **Frontend**
  - React.js
  - React Bootstrap
  - React Router
  - React Icons
  - Axios

- **Backend**
  - Node.js
  - Express.js
  - MySQL
  - JWT Authentication

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hospital-management-system.git
   cd hospital-management-system
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in server directory
   - Create `.env` file in client directory

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm start

   # Start frontend server (in a new terminal)
   cd client
   npm start
   ```

## Environment Variables

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Server (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hospital_db
JWT_SECRET=your_jwt_secret
```

## Database Setup

1. Create a MySQL database named `hospital_db`
2. Import the schema from `server/database/schema.sql`
3. Update the database configuration in server's `.env` file

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Screenshots

[Add screenshots of your application here]

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/hospital-management-system](https://github.com/yourusername/hospital-management-system)
