// Inicializar Iconos
lucide.createIcons();

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const AUTH_KEY = 'admin_logged_in';
let db = [];

const firebaseConfig = {
  apiKey: "AIzaSyAoPkJFF18hrd85VgrduPUTVI1xK--hm1E",
  authDomain: "rifas-pro-800bb.firebaseapp.com",
  projectId: "rifas-pro-800bb",
  storageBucket: "rifas-pro-800bb.firebasestorage.app",
  messagingSenderId: "726708628794",
  appId: "1:726708628794:web:a53b7469c432f802257403",
  measurementId: "G-KGR9HSRM9Z"
};

let app;
let firestore;
let participantsRef;

try {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    participantsRef = collection(firestore, 'participantes');
    console.log('Firebase inicializado correctamente');
} catch (error) {
    console.error('Error inicializando Firebase:', error);
    alert('Error iniciando Firebase: ' + (error.message || error));
}

function handleFirebaseError(error) {
    console.error('Error Firebase:', error);
    const message = error && error.code === 'permission-denied'
        ? 'Acceso denegado. Revisa las reglas de Firestore o el estado de tu proyecto Firebase.'
        : (error.message || 'Ocurrió un error desconocido con Firebase.');
    alert(message);
}

function loadData() {
    if (!participantsRef) {
        console.error('Firebase no está inicializado. No se puede cargar la colección.');
        return;
    }

    const q = query(participantsRef, orderBy('nro', 'asc'));
    onSnapshot(q, snapshot => {
        db = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            db.push({
                id: docSnap.id,
                nombre: data.nombre,
                dni: data.dni,
                tel: data.tel,
                loc: data.loc,
                nro: data.nro,
                metodo: data.metodo,
                medioPago: data.medioPago,
                cuotas: data.cuotas || 0
            });
        });
        updateUI();
    }, error => {
        handleFirebaseError(error);
    });
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
    if (pass === 'hospi2026') {
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
async function addParticipante() {
    const nro = String(document.getElementById('reg-nro').value).trim();
    const nombre = document.getElementById('reg-nom').value;
    const apellido = document.getElementById('reg-ape').value;

    if (!nro || !nombre || !apellido) {
        alert("⚠️ Por favor, completa Nombre, Apellido y Número.");
        return;
    }

    // Validar si el número ya existe (comparar como string)
    if (db.find(x => String(x.nro) === nro)) {
        alert("❌ ERROR: El número " + nro + " ya está reservado por otro participante.");
        return;
    }

    const metodo = document.getElementById('reg-metodo').value;
    const medioPago = document.getElementById('reg-medio-pago').value;
    const cuotasIniciales = metodo === 'cuotas'
        ? parseInt(document.getElementById('reg-cuotas-ini').value, 10) || 0
        : 4;

    const nuevo = {
        nombre: `${nombre} ${apellido}`,
        dni: document.getElementById('reg-dni').value || '---',
        tel: document.getElementById('reg-tel').value || '---',
        loc: document.getElementById('reg-loc').value || '---',
        nro: nro,
        metodo: metodo,
        medioPago: medioPago,
        cuotas: cuotasIniciales
    };

    if (!participantsRef) {
        alert('Firebase no está inicializado. Revisa la configuración y recarga la página.');
        return;
    }

    try {
        console.log('Guardando participante:', nuevo);
        await addDoc(participantsRef, nuevo);
        console.log('Participante guardado exitosamente');
        alert("✅ Registro guardado correctamente.");
        document.querySelectorAll('input').forEach(i => i.value = '');
        document.getElementById('reg-metodo').value = 'contado';
        document.getElementById('reg-medio-pago').value = 'Transferencia';
        document.getElementById('box-cuotas').classList.add('hidden');
        updateUI();
        document.getElementById('reg-nom').focus();
    } catch (error) {
        console.error('Error guardando participante:', error);
        handleFirebaseError(error);
    }
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
    // Mostrar pendientes normalmente (cuotas < 4).
    // Si hay un filtro activo, incluimos también el registro aunque ya tenga 4 cuotas
    // para que el usuario pueda verlo hasta que lo elimine manualmente.
    let pendientes = db.filter(x => x.cuotas < 4 || (filter && x.nro.toString().includes(filter)));
    if (filter) {
        pendientes = pendientes.filter(x => x.nro.toString().includes(filter));
    }
    
    if (pendientes.length === 0) {
        pendBox.innerHTML = '<p style="color:gray; text-align:center;">No hay pagos pendientes.</p>';
    } else {
        pendientes.forEach(x => {
            const porcentaje = (x.cuotas / 4) * 100;
            // Color dinámico: amarillo mientras no esté completo, verde si llegó a 4 cuotas.
            const fillColor = x.cuotas >= 4 ? 'var(--success)' : 'var(--warning)';
            const actionButton = x.cuotas < 4
                ? `<button class="btn-main" onclick="cobrarCuota('${x.id}')">Abonar Cuota</button>`
                : `<button class="btn-main" disabled style="background:#94a3b8; cursor:default">Completado</button>`;

            pendBox.innerHTML += `
                <div class="card-white" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex-grow:1">
                        <h3 style="color:var(--primary); text-transform:uppercase;">${x.nombre}</h3>
                        <p style="font-size:0.9rem; color:var(--text-muted)">Nº RIFA: <strong>${x.nro}</strong> | Tel: ${x.tel}</p>
                        <p style="font-size:0.9rem; color:var(--text-muted)">Tipo: ${x.metodo === 'cuotas' ? 'Cuotas' : 'Contado'} | Medio: ${x.medioPago || '---'}</p>
                        <div style="background:#e2e8f0; height:10px; border-radius:10px; margin:12px 0; width:90%; position:relative;">
                            <div style="background:${fillColor}; width:${porcentaje}%; height:100%; border-radius:10px; transition:0.3s;"></div>
                        </div>
                        <span style="font-weight:700; color:${fillColor}">PAGADO: ${x.cuotas} de 4 CUOTAS</span>
                    </div>
                    ${actionButton}
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
                            onclick="eliminarRegistro('${x.id}')">
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
async function cobrarCuota(id) {
    const p = db.find(x => x.id === id);
    if (p && p.cuotas < 4) {
        try {
            const docRef = doc(firestore, 'participantes', id);
            await updateDoc(docRef, { cuotas: p.cuotas + 1 });
            if (p.cuotas + 1 === 4) {
                alert("¡Felicidades! " + p.nombre + " ha completado el pago.");
            }
        } catch (error) {
            console.error('Error actualizando cuota:', error);
            alert('No se pudo actualizar la cuota.');
        }
    }
}

async function eliminarRegistro(id) {
    if (confirm("¿Estás seguro de eliminar este participante de forma permanente?")) {
        try {
            const docRef = doc(firestore, 'participantes', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error eliminando participante:', error);
            alert('No se pudo eliminar el participante.');
        }
    }
}

// 7. RESTABLECER TODO
async function resetAll() {
    if (confirm("¿Estás seguro de restablecer todo? Se perderán todos los datos.")) {
        try {
            const snapshot = await getDocs(participantsRef);
            const promises = snapshot.docs.map(docSnap => deleteDoc(doc(firestore, 'participantes', docSnap.id)));
            await Promise.all(promises);
            alert("✅ Todo ha sido restablecido.");
        } catch (error) {
            console.error('Error restableciendo datos:', error);
            alert('No se pudo restablecer los datos.');
        }
    }
}

window.login = login;
window.logout = logout;
window.showPage = showPage;
window.addParticipante = addParticipante;
window.checkCuotas = checkCuotas;
window.filterPend = filterPend;
window.filterFin = filterFin;
window.filterElim = filterElim;
window.exportFinalizados = exportFinalizados;
window.cobrarCuota = cobrarCuota;
window.eliminarRegistro = eliminarRegistro;
window.resetAll = resetAll;

// Carga inicial
checkLogin();