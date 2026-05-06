// Inicializar Iconos
lucide.createIcons();

const STORAGE_KEY = 'rifas_data';
const AUTH_KEY = 'admin_logged_in';
let db = [];

function loadData() {
    db = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    updateUI();
}

loadData();

// LOGIN SYSTEM
function checkLogin() {
    const loggedIn = localStorage.getItem(AUTH_KEY);
    if (loggedIn === 'true') {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        updateUI();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }
}

function login() {
    const pass = document.getElementById('login-pass').value;
    if (pass === 'admin') {
        localStorage.setItem(AUTH_KEY, 'true');
        checkLogin();
    } else {
        alert('Contraseña incorrecta');
    }
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    checkLogin();
}

// 1. NAVEGACIÓN ENTRE SECCIONES
function showPage(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (el) el.classList.add('active');
    updateUI();
}

// 3. GUARDAR PARTICIPANTE
function addParticipante() {
    const nro = document.getElementById('reg-nro').value;
    const nombre = document.getElementById('reg-nom').value;
    const apellido = document.getElementById('reg-ape').value;

    if (!nro || !nombre || !apellido) {
        alert("⚠️ Por favor, completa Nombre, Apellido y Número.");
        return;
    }

    // Validar si el número ya existe
    if (db.find(x => x.nro === nro)) {
        alert("❌ ERROR: El número " + nro + " ya está reservado por otro participante.");
        return;
    }

    const metodo = document.getElementById('reg-metodo').value;
    const medioPago = document.getElementById('reg-medio-pago').value;
    const cuotasIniciales = metodo === 'cuotas'
        ? parseInt(document.getElementById('reg-cuotas-ini').value, 10) || 0
        : 4;

    const nuevo = {
        id: Date.now(), // ID único para no confundir al eliminar
        nombre: `${nombre} ${apellido}`,
        dni: document.getElementById('reg-dni').value || '---',
        tel: document.getElementById('reg-tel').value || '---',
        loc: document.getElementById('reg-loc').value || '---',
        nro: nro,
        metodo: metodo,
        medioPago: medioPago,
        cuotas: cuotasIniciales
    };

    db.push(nuevo);
    saveData();
    alert("✅ Registro guardado correctamente.");
    
    // Limpiar campos
    document.querySelectorAll('input').forEach(i => i.value = '');
    showPage('dashboard', document.querySelector('.nav-item'));
}

// 4. ACTUALIZAR LISTAS Y ESTADÍSTICAS
function updateUI() {
    // Contadores
    document.getElementById('count-total').innerText = db.length;
    document.getElementById('count-pend').innerText = db.filter(x => x.cuotas < 4).length;
    document.getElementById('count-fin').innerText = db.filter(x => x.cuotas === 4).length;

    updatePend();
    updateFin();
    updateElim();

    lucide.createIcons();
}

function updatePend(filter = '') {
    const pendBox = document.getElementById('list-pendientes');
    pendBox.innerHTML = '';
    let pendientes = db.filter(x => x.cuotas < 4);
    if (filter) {
        pendientes = pendientes.filter(x => x.nro.toString().includes(filter));
    }
    
    if (pendientes.length === 0) {
        pendBox.innerHTML = '<p style="color:gray; text-align:center;">No hay pagos pendientes.</p>';
    } else {
        pendientes.forEach(x => {
            const porcentaje = (x.cuotas / 4) * 100;
            pendBox.innerHTML += `
                <div class="card-white" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex-grow:1">
                        <h3 style="color:var(--primary); text-transform:uppercase;">${x.nombre}</h3>
                        <p style="font-size:0.9rem; color:var(--text-muted)">Nº RIFA: <strong>${x.nro}</strong> | Tel: ${x.tel}</p>
                        <p style="font-size:0.9rem; color:var(--text-muted)">Tipo: ${x.metodo === 'cuotas' ? 'Cuotas' : 'Contado'} | Medio: ${x.medioPago || '---'}</p>
                        <div style="background:#e2e8f0; height:10px; border-radius:10px; margin:12px 0; width:90%; position:relative;">
                            <div style="background:var(--warning); width:${porcentaje}%; height:100%; border-radius:10px; transition:0.3s;"></div>
                        </div>
                        <span style="font-weight:700; color:var(--warning)">PAGADO: ${x.cuotas} de 4 CUOTAS</span>
                    </div>
                    <button class="btn-main" onclick="cobrarCuota(${x.id})">Abonar Cuota</button>
                </div>`;
        });
    }
}

function checkCuotas(value) {
    const cuotasBox = document.getElementById('box-cuotas');
    if (value === 'cuotas') {
        cuotasBox.classList.remove('hidden');
    } else {
        cuotasBox.classList.add('hidden');
    }
}

function updateFin(filter = '') {
    const finBox = document.getElementById('list-finalizados');
    finBox.innerHTML = '';
    let finalizados = db.filter(x => x.cuotas === 4);
    if (filter) {
        finalizados = finalizados.filter(x => x.nro.toString().includes(filter));
    }
    
    if (finalizados.length === 0) {
        finBox.innerHTML = '<p style="color:gray; text-align:center;">Aún no hay rifas pagadas totalmente.</p>';
    } else {
        finalizados.forEach(x => {
            finBox.innerHTML += `
                <div class="card-white" style="margin-bottom:10px; border-left: 5px solid #22c55e;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap: 24px; flex-wrap: wrap;">
                        <div>
                            <strong style="font-size:1.1rem;">${x.nombre}</strong>
                            <p style="color:var(--text-muted)">Rifa: ${x.nro} | DNI: ${x.dni}</p>
                            <p style="color:var(--text-muted)">Tel: ${x.tel} | Tipo: ${x.metodo === 'cuotas' ? 'Cuotas' : 'Contado'} | Medio: ${x.medioPago || '---'}</p>
                        </div>
                        <span style="color:#16a34a; font-weight:700;">✅ PAGADO TOTAL</span>
                    </div>
                </div>`;
        });
    }
}

function updateElim(filter = '') {
    const elimBox = document.getElementById('list-eliminar');
    elimBox.innerHTML = '';
    let registros = db;
    if (filter) {
        registros = registros.filter(x => 
            x.nro.toString().includes(filter) || 
            x.nombre.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    if (registros.length === 0) {
        elimBox.innerHTML = '<p style="color:gray; text-align:center;">No hay registros que coincidan.</p>';
    } else {
        registros.forEach(x => {
            elimBox.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid var(--border); align-items:center;">
                    <div>
                        <span style="font-weight:bold; color:var(--primary);">#${x.nro}</span> - <span>${x.nombre}</span>
                    </div>
                    <button style="background:#fee2e2; color:#ef4444; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600;" 
                            onclick="eliminarRegistro(${x.id})">
                        Eliminar 🗑️
                    </button>
                </div>`;
        });
    }
}

// SEARCH FUNCTIONS
function filterPend() {
    const filter = document.getElementById('search-pend').value;
    updatePend(filter);
}

function filterFin() {
    const filter = document.getElementById('search-fin').value;
    updateFin(filter);
}

function filterElim() {
    const filter = document.getElementById('search-elim').value;
    updateElim(filter);
}

function exportFinalizados() {
    const finalizados = db.filter(x => x.cuotas === 4);
    if (finalizados.length === 0) {
        alert('No hay participantes finalizados para exportar.');
        return;
    }

    const rows = [
        ['Nombre', 'DNI', 'Teléfono', 'Localidad', 'Número de Rifa', 'Tipo de Pago', 'Medio de Pago', 'Cuotas', 'Estado']
    ];

    finalizados.forEach(x => {
        rows.push([
            x.nombre,
            x.dni,
            x.tel,
            x.loc,
            x.nro,
            x.metodo === 'cuotas' ? 'Cuotas' : 'Contado',
            x.medioPago || '',
            x.cuotas,
            'Finalizado'
        ]);
    });

    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finalizados_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 5. ACCIONES (COBRAR Y ELIMINAR)
function cobrarCuota(id) {
    const p = db.find(x => x.id === id);
    if (p && p.cuotas < 4) {
        p.cuotas += 1;
        saveData();
        if(p.cuotas === 4) alert("¡Felicidades! " + p.nombre + " ha completado el pago.");
    }
}

function eliminarRegistro(id) {
    if (confirm("¿Estás seguro de eliminar este participante de forma permanente?")) {
        db = db.filter(x => x.id !== id);
        saveData();
    }
}

// 7. RESTABLECER TODO
function resetAll() {
    if (confirm("¿Estás seguro de restablecer todo? Se perderán todos los datos.")) {
        db = [];
        localStorage.removeItem('rifas_data');
        updateUI();
        alert("✅ Todo ha sido restablecido.");
    }
}

// Carga inicial
checkLogin();