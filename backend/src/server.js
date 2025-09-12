// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Route imports
const aiRoutes =require("./routes/aiRoutes.js");
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const contactRoutes = require('./routes/contacts');

const emailService = require('./services/emailService');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MailFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Mount routes (safe to mount before init; server will start after init)
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contacts', contactRoutes);
app.use("/api/ai", aiRoutes);


// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// STARTUP: connect DB, init emailService, then start server
const PORT = process.env.PORT || 5000;
let server = null;

async function startServer() {
  try {
    // 1) Connect database (await if it returns a promise)
    await connectDatabase();

    // 2) Initialize email service (await so transporter is ready before serving requests)
    try {
      await emailService.init();
      console.log('📧 Email service initialized (ready to send).');
    } catch (err) {
      // don't crash the whole server on email init failure — warn and continue
      console.warn('⚠️ Email service failed to initialize. Test/send endpoints may fail until fixed.');
      console.warn(err && err.message ? err.message : err);
    }

    // 3) Start listening
    server = app.listen(PORT, () => {
      console.log(`
🚀 MailFlow API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
AI_API_KEY:${process.env.COHERE_API_KEY}
🌐 Port: ${PORT}
🔗 API Base: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/api/health
📧 Email Service: ${process.env.EMAIL_HOST ? '✅ Configured' : '❌ Not configured (using Ethereal fallback if available)'}
🗄️  Database: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not connected (check logs)'}
      `);
    });

  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

// Start it
startServer();

// Graceful shutdown & error handling (unchanged)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err && err.message ? err.message : err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.message ? err.message : err);
  console.error(err && err.stack ? err.stack : '');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => console.log('Process terminated'));
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  if (server) {
    server.close(() => console.log('Process terminated'));
  } else {
    process.exit(0);
  }
});

module.exports = app;
