// --- 1. ESTADO DE LA APLICACIÓN (DATOS) ---

let staffGeneral = JSON.parse(localStorage.getItem('staffGeneral')) || [];
let vuelos = JSON.parse(localStorage.getItem('vuelos')) || [
    { id: 'AR1234', origen: 'EZE', destino: 'MAD', hora: '08:00', estado: 'Pendiente', grupo: null },
    { id: 'IB6842', origen: 'GRU', destino: 'EZE', hora: '09:30', estado: 'Pendiente', grupo: null }
];

let grupos = JSON.parse(localStorage.getItem('grupos')) || [];
let grupoSeleccionadoId = null;



// --- 2. PERSISTENCIA ---

function guardarCambios() {
    localStorage.setItem('staffGeneral', JSON.stringify(staffGeneral));
    localStorage.setItem('vuelos', JSON.stringify(vuelos));
    localStorage.setItem('grupos', JSON.stringify(grupos));

}



// --- 3. LÓGICA DE DOCUMENTACIÓN AUTOMÁTICA ---

function generarDocumentos(rol) {
    const hoy = new Date();
    const vence = new Date();
    vence.setFullYear(hoy.getFullYear() + 1);
    const fechaVencimiento = vence.toLocaleDateString('es-AR');



    const docs = {
        CMA: { nombre: "CMA Clase 4", vencimiento: fechaVencimiento, esPermanente: false },
        MANEJO: { nombre: "Permiso Manejo", vencimiento: "PERMANENTE", esPermanente: true },
        SENIAL: { nombre: "Señalización", vencimiento: "PERMANENTE", esPermanente: true },
        SUP: { nombre: "Hab. Supervisor", vencimiento: fechaVencimiento, esPermanente: false }
    };

    if (rol === 'MAL') return [docs.CMA];
    if (rol === 'CIN' || rol === 'TRA') return [docs.CMA, docs.MANEJO, docs.SENIAL];
    if (rol === 'SUP') return [docs.CMA, docs.MANEJO, docs.SENIAL, docs.SUP];
    return [];

}



// --- 4. GESTIÓN DE GUARDIA Y GRUPOS ---



function crearNuevoGrupo() {
    // abrir el modal
    document.getElementById('modal-crear-grupo').classList.add('active');
}



function cerrarModalGrupo() {
    document.getElementById('modal-crear-grupo').classList.remove('active');
    document.getElementById('input-nombre-grupo').value = ''; // Limpiar
}



function confirmarCreacionGrupo() {
    const inputNombre = document.getElementById('input-nombre-grupo');
    const nombre = inputNombre.value;
    
    // Validamos el nombre
    if (!nombre || nombre.trim() === "") {
        // En lugar del alert, usamos tu modal de alerta estilizado
        mostrarAlerta("⚠️ Debes ingresar un nombre para identificar al grupo.");
        
        // Opcional: le damos un feedback visual al input
        inputNombre.style.borderColor = "#ef4444";
        setTimeout(() => { inputNombre.style.borderColor = "#e2e8f0"; }, 2000);
        return;
    }

    const nuevoGrupo = {
        id: Date.now(),
        nombre: nombre.trim(),
        estado: 'Disponible',
        descanso: 0,
        integrantes: []
    };

    grupos.push(nuevoGrupo);
    guardarCambios();
    actualizarInterfaz();
    cerrarModalGrupo(); 
}

// Variable maestra: cambia esto y se actualiza todo el sistema
const CONTRASEÑA_CIERRE = "CCR123";

// Esta función abre el modal
function finalizarGuardia() {
    // 1. Inyectar la contraseña automáticamente al abrir
    document.getElementById('label-pass-cierre').innerText = "Contraseña requerida: " + CONTRASEÑA_CIERRE;
    document.getElementById('input-pass-cierre').placeholder = "Escribe " + CONTRASEÑA_CIERRE;
    
    // 2. Mostrar el modal
    document.getElementById('modal-finalizar-guardia').classList.add('active');
}


function cerrarModalFinalizar() {
    const modal = document.getElementById('modal-finalizar-guardia');
    if (modal) {
        modal.classList.remove('active');
        console.log("Modal removido correctamente");
    } else {
        console.error("No se encontró el elemento con id 'modal-finalizar-guardia'");
    }
}



// Esta función ejecuta la lógica real cuando el usuario confirma
function confirmarFinalizarGuardia() {
    const inputPass = document.getElementById('input-pass-cierre');
    const passIngresada = inputPass.value;

    // 1. Validación usando la constante maestra (ignorando mayúsculas/minúsculas)
    if (passIngresada.toUpperCase() !== CONTRASEÑA_CIERRE) {
        mostrarAlerta("Denegado", "La contraseña es incorrecta. La guardia no ha sido cerrada.");
        inputPass.style.borderColor = "#e63946"; // Feedback visual de error
        return;
    }

    // 2. Si es correcta, resetear estilo y limpiar campo
    inputPass.style.borderColor = "#e2e8f0";
    inputPass.value = "";

    // 3. Lógica de limpieza de datos
    grupos = []; 
    vuelos.forEach(v => {
        v.estado = 'Pendiente';
        v.grupo = null;
    });
    guardarCambios();
    actualizarInterfaz();

    // 4. Transición visual al mensaje de éxito
    document.getElementById('confirmacion-guardia').style.display = 'none';
    document.getElementById('exito-guardia').style.display = 'block';

    // 5. Cierre automático y reseteo de la UI para la próxima vez
    setTimeout(() => {
        cerrarModalFinalizar();
        
        // Esperamos a que el modal termine de cerrar visualmente para resetearlo
        setTimeout(() => {
            document.getElementById('confirmacion-guardia').style.display = 'block';
            document.getElementById('exito-guardia').style.display = 'none';
        }, 500);
    }, 2000);
}

function eliminarGrupoCompleto(id) {
    if(confirm("¿Eliminar este grupo permanentemente?")) {
        grupos = grupos.filter(g => g.id !== id);
        guardarCambios();
        actualizarInterfaz();
    }
}


// --- 5. RENDERIZADO DE INTERFAZ OPERATIVA ---
function renderizarVuelos() {
    const contenedor = document.getElementById('contenedor-vuelos');

    if (!contenedor) return;
    if (vuelos.length === 0) {
        contenedor.innerHTML = '<p class="empty-msg">No hay vuelos programados.</p>';
        return;
    }

    contenedor.innerHTML = vuelos.map(v => `
        <article class="flight-card ${v.estado.toLowerCase()}">

            <div class="flight-time-box">

                <span class="time">${v.hora}</span>

                <span class="label">Arribo</span>

            </div>



            <div class="flight-info-main">

                <span class="flight-id">${v.id}</span>

                <span class="flight-route">${v.origen} → ${v.destino}</span>

                ${v.grupo ? `<span class="assigned-tag"><i class="fa-solid fa-users"></i> ${v.grupo}</span>` : ''}

            </div>



            <div class="flight-actions">

                ${v.estado === 'Pendiente' ?

                    `<button class="btn-assign" onclick="asignarGrupo('${v.id}')">Asignar</button>` :

                    `<span class="status-done">Asignado</span>`}

            </div>

        </article>

    `).join('');

}



function renderizarGrupos() {
    const contenedor = document.getElementById('contenedor-grupos');

    if (!contenedor) return;

    // 1. Capturar IDs de grupos que están abiertos actualmente
    const gruposAbiertos = Array.from(contenedor.querySelectorAll('details[open]'))

    .map(d => d.getAttribute('data-id'));

    if (grupos.length === 0) {
        contenedor.innerHTML = '<div class="empty-msg"><p>No hay grupos creados para esta guardia.</p></div>';
        return;
    }

    contenedor.innerHTML = grupos.sort((a,b) => b.descanso - a.descanso).map(g => {
        const counts = {
            SUP: g.integrantes.filter(i => i.rol === 'SUP').length,
            CIN: g.integrantes.filter(i => i.rol === 'CIN').length,
            MAL: g.integrantes.filter(i => i.rol === 'MAL').length,
            TRA: g.integrantes.filter(i => i.rol === 'TRA').length
        };

        const estaCompleto = counts.SUP >= 1 && counts.CIN >= 1 && counts.MAL >= 2 && counts.TRA >= 1;

        // 2. Agregamos el atributo 'open' si el ID estaba en nuestra lista
        const isOpen = gruposAbiertos.includes(String(g.id));
        return `
            <details class="card group-card ${g.estado === 'Ocupado' ? 'busy' : ''}"
                     data-id="${g.id}" ${isOpen ? 'open' : ''}>
                <summary class="group-summary-content">
                    <div class="group-title-wrapper">
                        <i class="fa-solid fa-chevron-down group-arrow"></i>
                        <div>
                            <strong>${g.nombre}</strong>
                            ${estaCompleto ? '<i class="fa-solid fa-circle-check" style="color:#2a9d8f; margin-left:5px;" title="Equipo Mínimo OK"></i>' : ''}
                        </div>
                    </div>
                    <div class="group-actions-header">
                        <span class="badge ${g.estado === 'Disponible' ? 'badge-available' : 'badge-busy'}">${g.estado}</span>
                        <button class="btn-add-mini" onclick="abrirModalAsignar(${g.id}, event)">
                            <i class="fa-solid fa-user-plus"></i>
                        </button>
                        <button class="btn-delete-mini" onclick="eliminarGrupoCompleto(${g.id}, event)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </summary>
                <div class="group-expanded-detail">
                    <table class="staff-table-mini">
                        ${g.integrantes.length > 0 ?
                            g.integrantes.map((i, index) => `
                                <tr>
                                    <td><strong>${i.rol}</strong></td>
                                    <td>${i.nombre}</td>
                                    <td>
                                        <button class="btn-remove" onclick="quitarDelGrupo(${g.id}, ${index}, event)">
                                            &times;
                                        </button>
                                    </td>
                                </tr>`).join('')
                            : '<tr><td colspan="3" style="text-align:center; color:gray; padding:10px;">Sin personal asignado.</td></tr>'}
                    </table>
                </div>
            </details>
        `;
    }).join('');
}


// --- 6. GESTIÓN DE PERSONAL POR ROL (NUEVA VISTA) ---
function renderizarVistaPersonal() {
    const contenedor = document.getElementById('contenedor-roles');

    if (!contenedor) return;

    const busqueda = document.getElementById('busqueda-personal-rol').value.toLowerCase();

    const rolesConfig = [
        { id: 'SUP', titulo: 'Supervisores', icono: 'fa-user-tie' },
        { id: 'TRA', titulo: 'Tractoristas', icono: 'fa-truck-ramp-box' },
        { id: 'CIN', titulo: 'Cinteros', icono: 'fa-tape' },
        { id: 'MAL', titulo: 'Maleteros', icono: 'fa-suitcase' }
    ];

    contenedor.innerHTML = rolesConfig.map(rol => {
        const personalFiltrado = staffGeneral.filter(p =>
            p.rol === rol.id &&
            (p.nombre.toLowerCase().includes(busqueda) || p.legajo.includes(busqueda))
        );

        return `
            <div class="rol-column">
                <div class="rol-header">
                    <i class="fa-solid ${rol.icono}"></i>
                    <h3>${rol.titulo} (${personalFiltrado.length})</h3>
                </div>
                <div class="rol-cards-container">
                    ${personalFiltrado.map(p => `
                        <div class="person-card">
                            <div class="person-main-info">
                                <strong>${p.nombre}</strong>
                                <span>#${p.legajo}</span>
                            </div>
                            <div class="person-docs">
                                ${p.documentos.map((d, i) => `
                                    <div class="doc-item" onclick="editarDocumento('${p.legajo}', ${i})">
                                        <small>${d.nombre}</small>
                                        <span class="${d.esPermanente ? 'perm' : 'vence'}">${d.vencimiento}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="person-creds-toggle" onclick="toggleCredenciales('${p.legajo}')">
                                <i class="fa-solid fa-key"></i> Ver acceso <i id="icon-creds-${p.legajo}" class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div id="creds-${p.legajo}" class="creds-dropdown" style="display:none;">
                                <p>Usuario: <strong>${p.usuario || 'No asignado'}</strong></p>
                                <p>Pass: <strong>${p.pass || 'No asignado'}</strong></p>
                            </div>
                        </div>
                    `).join('')}
                    ${personalFiltrado.length === 0 ? '<p class="empty-col">No hay personal</p>' : ''}
                </div>
            </div>
        `;
    }).join('');
}


// FUNCIÓN AL FINAL PARA QUE EL TOGGLE FUNCIONE:
function toggleCredenciales(legajo) {
    const caja = document.getElementById(`creds-${legajo}`);
    const icono = document.getElementById(`icon-creds-${legajo}`);

    if (caja.style.display === 'none') {
        caja.style.display = 'block';

        if(icono) icono.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        caja.style.display = 'none';
        if(icono) icono.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
}


function editarDocumento(legajo, docIndex) {
    const empleado = staffGeneral.find(p => p.legajo === legajo);

    if (!empleado) return;
    const doc = empleado.documentos[docIndex];
    const nuevoVencimiento = prompt(`Editar vencimiento para ${doc.nombre} (${empleado.nombre}):`, doc.vencimiento);

    if (nuevoVencimiento !== null && nuevoVencimiento.trim() !== "") {
        empleado.documentos[docIndex].vencimiento = nuevoVencimiento;
        guardarCambios();
        renderizarVistaPersonal();
    }
}


// --- 7. REGISTRO STAFF GENERAL ---
function renderizarTablaPersonal() {
    const tbody = document.getElementById('tabla-personal-body');

    if (!tbody) return;

    const busqueda = document.getElementById('buscar-personal').value.toLowerCase();
    const staffFiltrado = staffGeneral.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) || p.legajo.includes(busqueda)
    );

    tbody.innerHTML = staffFiltrado.map((p) => `
        <tr>
            <td><strong>#${p.legajo}</strong></td>
            <td>${p.nombre}</td>
            <td><span class="badge-rol">${p.rol}</span></td>
            <td>
                <div class="creds-info">
                    <small>User: <strong>${p.usuario || '---'}</strong></small><br>
                    <small>Pass: <strong>${p.pass || '---'}</strong></small>
                </div>
            </td>
            <td>
                <div class="docs-list">
                    ${p.documentos.map(d => `
                        <span class="doc-tag ${d.esPermanente ? 'perm' : 'vence'}">
                            ${d.nombre}
                        </span>
                    `).join('')}
                </div>
            </td>
            <td>
                <button onclick="eliminarPersonal('${p.legajo}')" class="btn-delete" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}


// --- 8. LÓGICA DE ASIGNACIÓN (MODAL) ---
function abrirModalAsignar(id, event) {

    if(event) event.stopPropagation();
    grupoSeleccionadoId = id;
    const modal = document.getElementById('modal-asignar');
    modal.style.display = 'flex';
    renderizarListaPersonalSeleccionable();
}


function cerrarModal() {
    document.getElementById('modal-asignar').style.display = 'none';
}


function renderizarListaPersonalSeleccionable() {
    const contenedor = document.getElementById('lista-personal-disponible');

    if (!contenedor) return;
    const busqueda = document.getElementById('busqueda-asignar').value.toLowerCase();
    const nombresRoles = { 'SUP': 'Supervisores', 'TRA': 'Tractoristas', 'MAL': 'Maleteros', 'CIN': 'Cinteros' };

    let htmlFinal = '';
    Object.keys(nombresRoles).forEach(rolKey => {
        const personalDeEsteRol = staffGeneral.filter(p =>
            p.rol === rolKey && (p.nombre.toLowerCase().includes(busqueda) || p.legajo.includes(busqueda))
        );

        if (personalDeEsteRol.length > 0) {
            htmlFinal += `<h3 class="role-divider">${nombresRoles[rolKey]}</h3>`;
            personalDeEsteRol.forEach(p => {
                const yaAsignado = grupos.some(g => g.integrantes.some(i => i.legajo === p.legajo));
                htmlFinal += `
                    <div class="item-seleccionable ${yaAsignado ? 'disabled' : ''}"
                         onclick="${yaAsignado ? '' : `confirmarAsignacionALista('${p.legajo}')`}">
                        <div>
                            <strong>${p.nombre}</strong><br>
                            <small>#${p.legajo}</small>
                        </div>
                        ${yaAsignado ? '<span>Ocupado</span>' : '<i class="fa-solid fa-plus"></i>'}
                    </div>
                `;
            });
        }
    });

    contenedor.innerHTML = htmlFinal || '<p style="padding:20px; text-align:center;">No hay personal disponible.</p>';
}


function confirmarAsignacionALista(legajo) {
    const empleado = staffGeneral.find(p => p.legajo === legajo);
    const grupo = grupos.find(g => g.id === grupoSeleccionadoId);
    if (!empleado || !grupo) return;

    // 1. Definimos los cupos máximos permitidos
    const cuposMaximos = { 'SUP': 1, 'CIN': 1, 'MAL': 2 , 'TRA': 1 };

    // 2. Contamos cuántos hay actualmente de ese rol en el grupo
    const conteoActual = grupo.integrantes.filter(i => i.rol === empleado.rol).length;

    // 3. Validación: Si ya alcanzó el límite
    if (conteoActual >= cuposMaximos[empleado.rol]) {
        mostrarAlerta(`⚠️ No se puede agregar: El rol ${empleado.rol} ya alcanzó el cupo máximo permitido para este grupo.`);
        return;
    }

    // 4. Si pasa la validación, lo agregamos
    grupo.integrantes.push({...empleado});
    guardarCambios();
    renderizarGrupos();
    renderizarListaPersonalSeleccionable();
}

function quitarDelGrupo(grupoId, indexIntegrante, event) {

    // 1. Evitamos que el clic en el botón active el toggle del <details>
    if (event) {
        event.stopPropagation();
    }

    const grupo = grupos.find(g => g.id === grupoId);
    if (grupo) {
        grupo.integrantes.splice(indexIntegrante, 1);
        guardarCambios();
        renderizarGrupos();
    }
}


function asignarGrupo(vueloId) {
    const gruposAptos = grupos.filter(g => {
        if (g.estado !== 'Disponible') return false;
        const c = {
            SUP: g.integrantes.filter(i => i.rol === 'SUP').length,
            CIN: g.integrantes.filter(i => i.rol === 'CIN').length,
            MAL: g.integrantes.filter(i => i.rol === 'MAL').length,
            TRA: g.integrantes.filter(i => i.rol === 'TRA').length
        };
        return c.SUP >= 1 && c.CIN >= 1 && c.MAL >= 2 && c.TRA >= 1;
    });

    const grupoElegido = gruposAptos.sort((a,b) => b.descanso - a.descanso)[0];

    if (!grupoElegido) {
        // ica para mostrar el modal
        const modal = document.getElementById('modal-error-asignacion');
        const texto = document.getElementById('texto-error-asignacion');
        texto.innerText = "Para asignar un vuelo, el grupo debe contar con: 1 SUP, 1 CIN, 2 MAL y 1 TRA. Verifique la dotación actual.";
        modal.classList.add('active');
        return;
    }

    // ... resto de lógica de asignación exitosa ...
    const vuelo = vuelos.find(v => v.id === vueloId);
    vuelo.estado = 'Asignado';
    vuelo.grupo = grupoElegido.nombre;
    grupoElegido.estado = 'Ocupado';
    guardarCambios();
    actualizarInterfaz();
}

// Función para cerrar el nuevo modal
function cerrarModalErrorAsignacion() {
    document.getElementById('modal-error-asignacion').classList.remove('active');
}

// --- 9. NAVEGACIÓN Y EVENTOS ---
function ocultarTodasLasVistas() {
    document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.main-nav li').forEach(li => li.classList.remove('active'));
}

document.getElementById('nav-vuelos').addEventListener('click', () => {
    ocultarTodasLasVistas();
    document.getElementById('view-vuelos').style.display = 'block';
    document.getElementById('nav-vuelos').classList.add('active');
    actualizarInterfaz();
});

document.getElementById('nav-personal-lista').addEventListener('click', () => {
    ocultarTodasLasVistas();
    document.getElementById('view-personal-lista').style.display = 'block';
    document.getElementById('nav-personal-lista').classList.add('active');
    renderizarVistaPersonal();
});

document.getElementById('nav-staff-registro').addEventListener('click', () => {
    ocultarTodasLasVistas();
    document.getElementById('view-staff-registro').style.display = 'block';
    document.getElementById('nav-staff-registro').classList.add('active');
    renderizarTablaPersonal();
});


// Manejador del formulario del MODAL
// --- 9. NAVEGACIÓN Y EVENTOS ---
document.getElementById('form-nuevo-empleado').addEventListener('submit', (e) => {
    e.preventDefault();

    // Usamos .trim() para evitar espacios accidentales que rompan el login
    const legajo = document.getElementById('emp-legajo').value.trim();
    const usuario = document.getElementById('emp-usuario').value.trim();
    const nombre = document.getElementById('emp-nombre').value.trim();
    const password = document.getElementById('emp-password').value.trim();
    const rol = document.getElementById('emp-rol').value;

    // Validación de duplicados con  nuevo modal de alerta
    if(staffGeneral.some(p => p.legajo === legajo)) {
        mostrarAlerta("Error: El número de legajo ya se encuentra registrado.");
        return;
    }


    const nuevoTrabajador = {
        legajo: legajo,
        nombre: nombre,
        rol: rol,
        usuario: usuario,
        pass: password,
        documentos: generarDocumentos(rol)
    };

    // Guardar en el staff operativo
    staffGeneral.push(nuevoTrabajador);

    // Sincronización con el sistema de autenticación
    let usuariosAuth = JSON.parse(localStorage.getItem('usuarios_sistema')) || [];
    usuariosAuth.push({

        username: nuevoTrabajador.usuario,
        password: nuevoTrabajador.pass,
        role: nuevoTrabajador.rol
    });
    localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosAuth));
    guardarCambios();
    renderizarTablaPersonal();
    cerrarModalEmpleado();

    // --- AHORA LLAMA AL MODAL DE ÉXITO ---
    mostrarExito(`¡Excelente! El empleado ${nuevoTrabajador.nombre} ha sido creado y ya puede acceder al sistema.`);
});


// Controladores de visibilidad del modal
function abrirModalEmpleado() {
    document.getElementById('modal-nuevo-empleado').style.display = 'flex';
    actualizarListaDocsPreview(); // Para que muestre los docs según el rol inicial
}


function cerrarModalEmpleado() {
    document.getElementById('modal-nuevo-empleado').style.display = 'none';
    document.getElementById('form-nuevo-empleado').reset();
}

// Muestra qué documentos se generarán automáticamente
function actualizarListaDocsPreview() {
    const rol = document.getElementById('emp-rol').value;
    const lista = document.getElementById('lista-docs-preview');

    // Llamamos a lógica de la Sección 3
    const docsPrevia = generarDocumentos(rol);
    lista.innerHTML = docsPrevia.map(d => `
        <li><i class="fa-solid fa-check-double"></i> ${d.nombre}</li>
    `).join('');
}

// Variable global para capturar qué legajo queremos borrar
let legajoAEliminar = null;


function eliminarPersonal(legajo) {

    // En lugar del confirm() nativo, guardamos el legajo y abrimos el modal
    legajoAEliminar = legajo;
    const modal = document.getElementById('modal-eliminar-empleado');

    if (modal) {
        modal.classList.add('active');
    }
}


function cerrarModalEliminar() {
    legajoAEliminar = null; // Limpiamos la variable al cerrar
    document.getElementById('modal-eliminar-empleado').classList.remove('active');
}


function confirmarEliminarEmpleado() {
    if (!legajoAEliminar) return;

    // 1. Lógica de borrado
    const empleado = staffGeneral.find(p => p.legajo === legajoAEliminar);
    if (empleado) {
        let usuariosAuth = JSON.parse(localStorage.getItem('usuarios_sistema')) || [];
        usuariosAuth = usuariosAuth.filter(u => u.username !== empleado.usuario);
        localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosAuth));
    }
    staffGeneral = staffGeneral.filter(p => p.legajo !== legajoAEliminar);
    
    guardarCambios();
    renderizarTablaPersonal();

    // 2. Feedback visual SIN destruir el HTML
    const modalContent = document.querySelector('#modal-eliminar-empleado .modal-content-modern');
    
    // Guardamos el contenido original para restaurarlo después
    const contenidoOriginal = modalContent.innerHTML;
    
    modalContent.innerHTML = `
        <div style="text-align:center; padding: 40px;">
            <i class="fa-solid fa-circle-check" style="color: #2a9d8f; font-size: 4rem;"></i>
            <h2 style="margin-top: 20px;">¡Eliminado!</h2>
        </div>
    `;

    // 3. Restaurar después de 1.5s
    setTimeout(() => {
        modalContent.innerHTML = contenidoOriginal; // Restauramos el original
        cerrarModalEliminar();
    }, 1500);
}

function actualizarInterfaz() {
    renderizarVuelos();
    renderizarGrupos();
    if(document.getElementById('count-vuelos'))
        document.getElementById('count-vuelos').innerText = vuelos.filter(v => v.estado === 'Pendiente').length;
    if(document.getElementById('count-grupos'))
        document.getElementById('count-grupos').innerText = grupos.filter(g => g.estado === 'Disponible').length;
}


document.addEventListener('DOMContentLoaded', actualizarInterfaz);

// --- 10. CIERRE DE SESIÓN ---
function logout() {

    // 1. Opcional: Confirmar antes de salir para evitar clics accidentales
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {

        // 2. Limpiar el rol del localStorage para que nadie entre sin loguearse
        localStorage.removeItem("role");

        // 3. Redirigir al index (o login.html, como se llame tu archivo principal)
        // Si login está en la raíz y se llama index.html:

        window.location.href = "index.html";
    }
}

// 1. Seleccionamos los elementos
const modal = document.querySelector('.modal-overlay');
const btnAbrir = document.querySelector('.btn-add-personal');
const btnCerrar = document.querySelector('.btn-close-x'); // O el botón que tengas


// 2. Función para abrir
btnAbrir.addEventListener('click', () => {
    modal.classList.add('active');
});

// 3. Función para cerrar
btnCerrar.addEventListener('click', () => {
    modal.classList.remove('active');
});


// 4. Opcional: Cerrar si hacen clic fuera del recuadro blanco
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// --- 10. MODALES DE CONTROL (ACTUALIZADOS) ---

function mostrarAlerta(titulo, mensaje) {
    const modal = document.getElementById('modal-alerta');
    const tituloModal = document.getElementById('titulo-alerta');
    const texto = document.getElementById('mensaje-error');

    // Si no se envía mensaje pero sí título, intercambiamos o manejamos el error
    // Pero lo más fácil es: si solo envías 1 argumento, ese es el mensaje
    if (mensaje === undefined) {
        mensaje = titulo;
        titulo = "Aviso"; // Título por defecto
    }
    
    tituloModal.innerText = titulo;
    texto.innerText = mensaje;
    
    modal.classList.add('active');
}

// --- MODAL DE EMPLEADO CREADO CON EXITO ---
function cerrarModalAlerta() {
    document.getElementById('modal-alerta').classList.remove('active');
}

function mostrarExito(mensaje) {
    const modal = document.getElementById('modal-exito');
    document.getElementById('mensaje-exito').innerText = mensaje;
    modal.classList.add('active');
}

function cerrarModalExito() {
    document.getElementById('modal-exito').classList.remove('active');
}


function logout() {
    // Abre tu modal estilizado
    document.getElementById('modal-logout').classList.add('active');
}


function cerrarModalLogout() {
    document.getElementById('modal-logout').classList.remove('active');
}


function confirmarSalida() {
    localStorage.removeItem("role");
    window.location.href = "index.html";
}


function cerrarModalAlerta() {
    document.getElementById('modal-alerta').classList.remove('active');
}