const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (phoneNumber, otp, email) => {
  try {
    console.log('Attempting to send OTP via email to:', email);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully via email');
    return true;
  } catch (error) {
    console.error('Email Error:', error);
    return false;
  }
};

const sendAppointmentConfirmation = async (phoneNumber, appointmentDetails, email) => {
  try {
    console.log('Sending appointment confirmation via email to:', email);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Confirmation',
      html: `
        <h2>Appointment Confirmed!</h2>
        <p><strong>Date:</strong> ${appointmentDetails.date}</p>
        <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
        <p><strong>Status:</strong> ${appointmentDetails.status}</p>
        <p>Thank you for choosing our services!</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation sent via email');
    return true;
  } catch (error) {
    console.error('Email Error:', error);
    return false;
  }
};

module.exports = {
  sendOTP,
  sendAppointmentConfirmation
}; 