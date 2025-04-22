// Función para validar solo letras y espacios
function validarSoloLetras(texto) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
  }
  
  // Función para validar CURP (versión básica)
  function validarCURP(curp) {
    return /^[A-Z]{4}\d{6}[A-Z0-9]{8}$/.test(curp);
  }
  
  // Buscar persona por CURP
  async function buscarPersona() {
    const curpInput = document.getElementById('input-curp');
    const resultadoDiv = document.getElementById('resultado-busqueda');
    const curp = curpInput.value.trim().toUpperCase();
  
    // Validación básica
    if (!curp) {
      resultadoDiv.innerHTML = '<div class="alert alert-warning">Ingrese una CURP válida</div>';
      curpInput.focus();
      return;
    }
  
    // Validación formato CURP
    if (!validarCURP(curp)) {
      resultadoDiv.innerHTML = '<div class="alert alert-warning">Formato de CURP inválido. Debe tener 18 caracteres alfanuméricos</div>';
      curpInput.focus();
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/personas/${curp}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Persona no encontrada');
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
      console.error('Error en búsqueda:', error);
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
  
    // Validación campos vacíos
    if (!nuevaPersona.curp || !nuevaPersona.nombre || !nuevaPersona.apellido || !nuevaPersona.estado) {
      alert('Todos los campos son obligatorios');
      return;
    }
  
    // Validación formato CURP
    if (!validarCURP(nuevaPersona.curp)) {
      alert('Formato de CURP inválido. Debe tener 18 caracteres alfanuméricos');
      form.curp.focus();
      return;
    }
  
    // Validación solo letras para nombre y apellido
    if (!validarSoloLetras(nuevaPersona.nombre)) {
      alert('El nombre solo puede contener letras y espacios');
      form.nombre.focus();
      return;
    }
  
    if (!validarSoloLetras(nuevaPersona.apellido)) {
      alert('El apellido solo puede contener letras y espacios');
      form.apellido.focus();
      return;
    }
    if (!validarSoloLetras(nuevaPersona.estado)) {
      alert('El estado solo puede contener letras y espacios');
      form.estado.focus();
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/personas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(nuevaPersona)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }
  
      alert(`¡Registro exitoso!\nNombre: ${data.nombre}\nCURP: ${data.curp}`);
      form.reset();
      document.getElementById('resultado-busqueda').innerHTML = '';
    } catch (error) {
      console.error('Error en registro:', error);
      alert(`Error al registrar: ${error.message}`);
    }
  });
  
  // Validación en tiempo real para campos de solo letras
  document.getElementById('nombre').addEventListener('input', function() {
    if (this.value && !validarSoloLetras(this.value)) {
      this.classList.add('is-invalid');
    } else {
      this.classList.remove('is-invalid');
    }
  });
  
  document.getElementById('apellido').addEventListener('input', function() {
    if (this.value && !validarSoloLetras(this.value)) {
      this.classList.add('is-invalid');
    } else {
      this.classList.remove('is-invalid');
    }
  });