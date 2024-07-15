require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

// Custom Helmet configuration for CSP to allow inline scripts and downloads
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'"],  // Allow images to be loaded from the same origin
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false // Allow resources to be loaded from different origins
}));


// Path to the parent directory relative to where the server.js file is located
const parentDir = path.join(__dirname, '..');

// Serve static files from the parent directory (make sure your HTML, CSS, JS, etc., are organized correctly here)
app.use(express.static(parentDir));

// Explicit route for '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(parentDir, 'index.html'));
});

// Explicit route for '/index.html'
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(parentDir, 'index.html'));
});
// Serve static files, including documents for download
app.use('/pages', express.static(path.join(parentDir, 'pages')));
app.use('/css', express.static(path.join(parentDir, 'css')));
app.use('/documents', express.static(path.join(parentDir, 'documents')));

// Restrict CORS for public access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // Allow any domain to access your server
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Root route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(parentDir, 'index.html'));
});

// Email sending endpoint
app.post('/send', (req, res) => {
    const { name, email, message } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TARGET,
        subject: `Contact form submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Email send error: ${error.toString()}`);
            return res.status(500).send('Error sending message');
        }
        res.status(200).send('Message sent successfully');
    });
});


app.get('/test-email', (req, res) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'test@example.com', // Change to your test recipient
        subject: 'Test Email from NodeMailer',
        text: 'This is a test email sent using an App Password with Gmail and NodeMailer!'
    };
    const { name, email, message } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send('Failed to send email: ' + error.message);
        } else {
            res.send('Email sent successfully: ' + info.response);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

