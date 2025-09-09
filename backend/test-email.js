// backend/test-email.js (Create this file)
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing Email Setup...\n');
  
  // Check environment variables
  console.log('📋 Configuration:');
  console.log(`Host: ${process.env.EMAIL_HOST}`);
  console.log(`Port: ${process.env.EMAIL_PORT}`);
  console.log(`User: ${process.env.EMAIL_USER}`);
  console.log(`Pass: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    console.log('\n🔗 Testing connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('\n📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🧪 MailFlow Test Email',
      html: '<h1>Test Successful!</h1><p>Your email configuration is working! 🎉</p>',
      text: 'Test Successful! Your email configuration is working!'
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`🔗 Preview: ${nodemailer.getTestMessageUrl(info)}`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your .env file has correct EMAIL_* variables');
    console.error('2. Make sure you copied Ethereal credentials correctly');
    console.error('3. Restart your backend server after changing .env');
  }
}

testEmail();