const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// GET route (fixes "Cannot GET /api/send")
router.get('/send', (req, res) => {
  res.send("Contact API is working. Use POST to send data.");
});

// POST route to send message + save to DB + send email
router.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  try {
    // Save to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log('Error sending email:', err);
        return res.status(500).send('Message saved but email failed');
      }
      res.status(200).send('Message sent successfully and saved to database!');
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
