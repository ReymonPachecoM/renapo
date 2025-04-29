const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'JReymon123',
  database: 'personas_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    process.exit(1);
  }
  console.log('Conectado a MySQL correctamente');
});

module.exports = connection; // Exporta la conexión
