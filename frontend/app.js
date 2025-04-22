// Buscar persona por CURP
async function buscarPersona() {
    const curpInput = document.getElementById('input-curp');
    const resultadoDiv = document.getElementById('resultado-busqueda');
    const curp = curpInput.value.trim().toUpperCase();
  
    if (!curp) {
      resultadoDiv.innerHTML = '<div class="alert alert-warning">Ingrese una CURP</div>';
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/personas/${curp}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al buscar');
      }
  
      const persona = await response.json();
      
      resultadoDiv.innerHTML = `
        <div class="alert alert-success">
          <h4>${persona.nombre} ${persona.apellido}</h4>
          <p><strong>CURP:</strong> ${persona.curp}</p>
          <p><strong>Estado:</strong> ${persona.estado}</p>
          <small>Registrado: ${new Date(persona.fechaRegistro).toLocaleString()}</small>
        </div>
      `;
    } catch (error) {
      resultadoDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }
  
  // Registrar nueva persona
  document.getElementById('form-persona').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const nuevaPersona = {
      curp: form.curp.value.trim().toUpperCase(),
      nombre: form.nombre.value.trim(),
      apellido: form.apellido.value.trim(),
      estado: form.estado.value.trim()
    };
  
    // Validación frontend
    if (!nuevaPersona.curp || !nuevaPersona.nombre || !nuevaPersona.apellido || !nuevaPersona.estado) {
      alert('Todos los campos son obligatorios');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPersona)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }
  
      alert(`Registro exitoso!\nNombre: ${data.nombre}\nCURP: ${data.curp}`);
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    }
  });