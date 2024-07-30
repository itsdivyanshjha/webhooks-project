const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    const commits = req.body.commits;
    let emailContent = '';
    commits.forEach(commit => {
        emailContent += `Commit by ${commit.committer.name}:\n\n${commit.message}\n\n${commit.url}\n\n`;
    });

    if (emailContent) {
        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: process.env.EMAIL_RECEIVER,
            subject: `Changes made to the HTML document`,
            text: emailContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send(error.toString());
            }
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent: ' + info.response);
        });
    } else {
        console.log('No relevant commit data found.');
        res.status(200).send('No relevant commit data found.');
    }
});

// No need to listen on port as Vercel handles that
module.exports = app;
