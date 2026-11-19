/**
 * CRUD de Pacientes consumiendo la API de ADSO Cartago
 * Base URL: https://apipacientes.adsocartago.com/api/
 */

const BASE_URL = 'https://apipacientes.adsocartago.com/api';

// Elementos del DOM
const tablaPacientes = document.getElementById('tablaPacientes');
const formPaciente = document.getElementById('formPaciente');
const formBuscarId = document.getElementById('formBuscarId');
const inputIdBusqueda = document.getElementById('inputIdBusqueda');

// Modales de Bootstrap
const modalPaciente = new bootstrap.Modal(document.getElementById('modalPaciente'));
const modalVer = new bootstrap.Modal(document.getElementById('modalVer'));
const modalTitulo = document.getElementById('modalTitulo');
const modalHeader = document.getElementById('modalHeader');
const btnGuardar = document.getElementById('btnGuardar');

// Campos del formulario
const pacienteId = document.getElementById('pacienteId');
const pacienteNombre = document.getElementById('pacienteNombre');
const pacienteEdad = document.getElementById('pacienteEdad');
const pacienteGenero = document.getElementById('pacienteGenero');
const pacienteDiagnostico = document.getElementById('pacienteDiagnostico');

// ========================================================
// 1. LISTAR PACIENTES (GET)
// ========================================================
async function listarPacientes() {
    tablaPacientes.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Cargando pacientes...</td></tr>';

    try {
        const res = await fetch(`${BASE_URL}/listar.php`);
        const json = await res.json();

        if (json.exito && Array.isArray(json.datos)) {
            tablaPacientes.innerHTML = '';

            if (json.datos.length === 0) {
                tablaPacientes.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay pacientes registrados.</td></tr>';
                return;
            }

            json.datos.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold">#${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.age}</td>
                    <td><span class="badge bg-secondary">${p.gender}</span></td>
                    <td>${p.diagnosis || 'Ninguno'}</td>
                    <td class="text-muted small">${p.created_at || 'N/A'}</td>
                    <td class="text-center">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-info" onclick="verPaciente(${p.id})" title="Ver ficha">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="abrirModalEditar(${p.id}, '${escapeQuote(p.name)}', ${p.age}, '${p.gender}', '${escapeQuote(p.diagnosis || '')}')" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="eliminarPaciente(${p.id})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tablaPacientes.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error al listar:', error);
        tablaPacientes.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar los pacientes.</td></tr>';
    }
}

// ========================================================
// 2. VER PACIENTE POR ID (GET)
// ========================================================
async function verPaciente(id) {
    try {
        const res = await fetch(`${BASE_URL}/ver.php?id=${id}`);
        const json = await res.json();

        if (json.exito && json.datos) {
            const p = json.datos;
            document.getElementById('contenidoVer').innerHTML = `
                <div class="p-2">
                    <h5 class="fw-bold text-primary mb-3">${p.name}</h5>
                    <p class="mb-1"><strong>ID:</strong> #${p.id}</p>
                    <p class="mb-1"><strong>Edad:</strong> ${p.age} años</p>
                    <p class="mb-1"><strong>Género:</strong> ${p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : 'Otro'}</p>
                    <p class="mb-1"><strong>Diagnóstico:</strong> ${p.diagnosis || 'Ninguno'}</p>
                    <p class="mb-0"><strong>Fecha de registro:</strong> ${p.created_at || 'N/A'}</p>
                </div>
            `;
            modalVer.show();
        } else {
            alert(json.mensaje || `No se encontró el paciente con ID #${id}`);
        }
    } catch (error) {
        console.error('Error al ver paciente:', error);
        alert('Error al consultar el paciente.');
    }
}

// ========================================================
// 3. CREAR PACIENTE (POST)
// ========================================================
async function crearPaciente(datos) {
    try {
        const res = await fetch(`${BASE_URL}/crear.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const json = await res.json();

        if (json.exito) {
            alert('¡Paciente creado con éxito!');
            modalPaciente.hide();
            listarPacientes();
        } else {
            alert('Error al crear: ' + (Array.isArray(json.datos) ? json.datos.join(', ') : json.mensaje));
        }
    } catch (error) {
        console.error('Error al crear:', error);
        alert('Error de conexión al crear el paciente.');
    }
}

// ========================================================
// 4. ACTUALIZAR PACIENTE (POST)
// ========================================================
async function actualizarPaciente(datos) {
    try {
        const res = await fetch(`${BASE_URL}/actualizar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const json = await res.json();

        if (json.exito) {
            alert('¡Paciente actualizado con éxito!');
            modalPaciente.hide();
            listarPacientes();
        } else {
            alert('Error al actualizar: ' + (Array.isArray(json.datos) ? json.datos.join(', ') : json.mensaje));
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        alert('Error de conexión al actualizar.');
    }
}

// ========================================================
// 5. ELIMINAR PACIENTE (POST)
// ========================================================
async function eliminarPaciente(id) {
    if (!confirm(`¿Estás seguro de eliminar el paciente #${id}?`)) return;

    try {
        const res = await fetch(`${BASE_URL}/eliminar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: parseInt(id, 10) })
        });
        const json = await res.json();

        if (json.exito) {
            alert('Paciente eliminado correctamente.');
            listarPacientes();
        } else {
            alert('No se pudo eliminar: ' + json.mensaje);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error de conexión al eliminar.');
    }
}

// ========================================================
// Control de Formulario y Modales (Crear / Editar / Buscar)
// ========================================================

// Abrir modal en modo "Crear"
function abrirModalCrear() {
    formPaciente.reset();
    pacienteId.value = '';
    modalTitulo.textContent = 'Nuevo Paciente';
    modalHeader.className = 'modal-header bg-success text-white';
    btnGuardar.className = 'btn btn-success';
    btnGuardar.textContent = 'Guardar Paciente';
    modalPaciente.show();
}

// Abrir modal en modo "Editar" con los datos cargados
function abrirModalEditar(id, nombre, edad, genero, diagnostico) {
    pacienteId.value = id;
    pacienteNombre.value = nombre;
    pacienteEdad.value = edad;
    pacienteGenero.value = genero;
    pacienteDiagnostico.value = diagnostico;

    modalTitulo.textContent = `Editar Paciente #${id}`;
    modalHeader.className = 'modal-header bg-warning text-dark';
    btnGuardar.className = 'btn btn-warning';
    btnGuardar.textContent = 'Actualizar Cambios';
    modalPaciente.show();
}

// Evento submit del formulario (Detecta si es Crear o Actualizar según si hay ID)
formPaciente.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = pacienteId.value;
    const datos = {
        name: pacienteNombre.value.trim(),
        age: parseInt(pacienteEdad.value, 10),
        gender: pacienteGenero.value,
        diagnosis: pacienteDiagnostico.value.trim() || null
    };

    if (id) {
        // Si hay ID -> Actualizar
        datos.id = parseInt(id, 10);
        actualizarPaciente(datos);
    } else {
        // Si no hay ID -> Crear
        crearPaciente(datos);
    }
});

// Evento para buscar por ID desde la caja de búsqueda superior
formBuscarId.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = inputIdBusqueda.value.trim();
    if (id) {
        verPaciente(id);
    }
});

// Helper para comillas en onclick
function escapeQuote(str) {
    return (str || '').replace(/'/g, "\\'");
}

// Cargar la lista al iniciar
document.addEventListener('DOMContentLoaded', listarPacientes);
