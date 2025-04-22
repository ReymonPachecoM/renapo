const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Configuración básica
app.use(express.json());
app.use(cors());

// Base de datos
const DB_PATH = path.join(__dirname, 'db.json');

// Helper para la base de datos
const readDB = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '[]');
      return [];
    }
    return JSON.parse(fs.readFileSync(DB_PATH));
  } catch (error) {
    console.error('Error reading DB:', error);
    return [];
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing DB:', error);
    return false;
  }
};

// Validación CURP simplificada
const isValidCURP = (curp) => {
  return curp && curp.length === 18;
};

// Endpoints
app.get('/personas/:curp', (req, res) => {
  const curp = req.params.curp.toUpperCase();
  const db = readDB();
  const persona = db.find(p => p.curp === curp);

  if (!persona) {
    return res.status(404).json({ error: 'Persona no encontrada' });
  }
  res.json(persona);
});

app.post('/personas', (req, res) => {
  const { curp, nombre, apellido, estado } = req.body;
  const db = readDB();

  // Validación básica
  if (!curp || !nombre || !apellido || !estado) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const curpUpper = curp.toUpperCase();
  
  if (db.some(p => p.curp === curpUpper)) {
    return res.status(409).json({ error: 'La CURP ya existe' });
  }

  const nuevaPersona = {
    curp: curpUpper,
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    estado: estado.trim(),
    fechaRegistro: new Date().toISOString()
  };

  db.push(nuevaPersona);
  writeDB(db);
  
  res.status(201).json(nuevaPersona);
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`GET  /personas/:curp`);
  console.log(`POST /personas`);
});