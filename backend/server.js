const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config/env');
const phoneRoutes = require('./src/routes/phone.routes');
const userRoutes = require('./src/routes/user.routes');
const errorHandler = require('./src/middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Phone Store API' });
});

// Routes
app.use('/api/phones', phoneRoutes);
app.use('/api/users', userRoutes);

// Error Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
