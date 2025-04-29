const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa la conexión a la base de datos

// GET
router.get('/:curp', (req, res) => {
  const curp = req.params.curp.toUpperCase();
  console.log(`Buscando CURP: ${curp}`);

  db.query('SELECT * FROM personas WHERE curp = ?', [curp], (error, results) => {
    if (error) return res.status(500).json({ success: false, error: 'Error en la consulta' });
    if (results.length === 0) return res.status(404).json({ success: false, error: 'Persona no encontrada' });
    res.json({ success: true, data: results[0] });
  });
});

// POST
router.post('/', (req, res) => {
  const { curp, nombre, apellido, estado } = req.body;

  if (!curp || !nombre || !apellido || !estado) {
    return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
  }

  db.query('SELECT * FROM personas WHERE curp = ?', [curp], (err, results) => {
    if (results.length > 0) {
      return res.status(409).json({ success: false, error: 'CURP ya registrada' });
    }

    db.query('INSERT INTO personas (curp, nombre, apellido, estado, fechaRegistro) VALUES (?, ?, ?, ?, NOW())', 
      [curp, nombre, apellido, estado], (error, result) => {
        if (error) return res.status(500).json({ success: false, error: 'Error al insertar' });
        res.status(201).json({
          success: true,
          message: 'Persona registrada',
          data: { curp, nombre, apellido, estado, fechaRegistro: new Date() }
        });
      });
  });
});

module.exports = router;
