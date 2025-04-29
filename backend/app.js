const express = require('express');
const cors = require('cors');
const personasRoutes = require('./routes/personas');
const db = require('./db'); // Importa la conexión a la base de datos

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080', 'http://192.168.0.6:8080'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para log
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.use('/personas', personasRoutes);

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

module.exports = app;
