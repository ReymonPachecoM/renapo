const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Configuración mejorada
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080', 'http://192.168.0.6:8080'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para log de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

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

// Validaciones mejoradas
const isValidCURP = (curp) => {
  return /^[A-Z]{4}\d{6}[A-Z0-9]{8}$/.test(curp);
};

const isValidNombreApellido = (texto) => {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
};

const isValidEstado = (texto) => {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
};

// Endpoints
app.get('/personas/:curp', (req, res) => {
  try {
    const curp = req.params.curp.toUpperCase();
    console.log(`Buscando CURP: ${curp}`); // Log para depuración
    
    const db = readDB();
    console.log(`Base de datos contiene: ${db.length} registros`); // Log para depuración
    
    if (!isValidCURP(curp)) {
      console.log('CURP inválida'); // Log para depuración
      return res.status(400).json({ 
        success: false,
        error: 'Formato de CURP inválido',
        formato_esperado: '4 letras + 6 números + 8 caracteres alfanuméricos'
      });
    }

    const persona = db.find(p => p.curp === curp);
    console.log('Resultado de búsqueda:', persona); // Log para depuración

    if (!persona) {
      return res.status(404).json({ 
        success: false,
        error: 'Persona no encontrada',
        curp_buscada: curp
      });
    }
    
    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Error en GET /personas/:curp:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al buscar persona'
    });
  }
});

app.post('/personas', (req, res) => {
  const { curp, nombre, apellido, estado } = req.body;
  const db = readDB();

  // Validación de campos obligatorios
  const camposFaltantes = [];
  if (!curp) camposFaltantes.push('curp');
  if (!nombre) camposFaltantes.push('nombre');
  if (!apellido) camposFaltantes.push('apellido');
  if (!estado) camposFaltantes.push('estado');
  
  if (camposFaltantes.length > 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Faltan campos obligatorios',
      campos_faltantes: camposFaltantes
    });
  }

  const curpUpper = curp.toUpperCase();
  
  // Validación formato CURP
  if (!isValidCURP(curpUpper)) {
    return res.status(400).json({ 
      success: false,
      error: 'Formato de CURP inválido',
      curp_recibida: curp,
      formato_esperado: '4 letras + 6 números + 8 caracteres alfanuméricos'
    });
  }

  // Validación solo letras para nombre y apellido
  if (!isValidNombreApellido(nombre)) {
    return res.status(400).json({ 
      success: false,
      error: 'El nombre solo puede contener letras y espacios',
      nombre_recibido: nombre
    });
  }

  if (!isValidNombreApellido(apellido)) {
    return res.status(400).json({ 
      success: false,
      error: 'El apellido solo puede contener letras y espacios',
      apellido_recibido: apellido
    });
  }

  // Validación solo letras para estado
  if (!isValidEstado(estado)) {
    return res.status(400).json({ 
      success: false,
      error: 'El estado solo puede contener letras y espacios',
      estado_recibido: estado
    });
  }

  // Verificar si la CURP ya existe
  if (db.some(p => p.curp === curpUpper)) {
    return res.status(409).json({ 
      success: false,
      error: 'La CURP ya está registrada',
      curp: curpUpper
    });
  }

  const nuevaPersona = {
    curp: curpUpper,
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    estado: estado.trim(),
    fechaRegistro: new Date().toISOString()
  };

  db.push(nuevaPersona);
  
  if (!writeDB(db)) {
    return res.status(500).json({
      success: false,
      error: 'Error al guardar en la base de datos'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Persona registrada con éxito',
    data: nuevaPersona
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    body: req.body,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`GET  /personas/:curp - Buscar persona por CURP`);
  console.log(`POST /personas - Registrar nueva persona`);
  console.log('\nValidaciones implementadas:');
  console.log('- Formato CURP: 4 letras + 6 números + 8 caracteres');
  console.log('- Nombre/Apellido: Solo letras y espacios');
  console.log('- Estado: Solo letras y espacios');
});