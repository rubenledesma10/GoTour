// Toast normal / éxito
function showToast(message, duration = 5000) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: true, delay: duration });
    toast.show();
}

// Toast que recarga al aceptar
function showToastReload(message, redirectUrl = "/") {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message}
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: false });
    toast.show();

    const acceptBtn = document.getElementById('toastAccept');
    acceptBtn.addEventListener('click', () => {
        toast.hide();
        location.href = redirectUrl;
    }, { once: true });
}

// Toast de confirmación con callback
function showConfirmToast(message, callback) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message}
        <div class="mt-2 text-center">
            <button id="confirmYes" class="btn btn-sm btn-success me-2">Sí</button>
            <button id="confirmNo" class="btn btn-sm btn-secondary">No</button>
        </div>
    `;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: false });
    toast.show();

    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    yesBtn.addEventListener('click', () => { toast.hide(); callback(true); }, { once: true });
    noBtn.addEventListener('click', () => { toast.hide(); callback(false); }, { once: true });
}

// -----------------------------
// Funciones para usuarios
function deleteUser(userId) {
    const token = localStorage.getItem("token");
    if (!token) { showToastReload("Session expired. Please login again.", "/"); return; }

    showConfirmToast("¿Estás seguro que quieres desactivar este usuario?", confirmed => {
        if (!confirmed) return;

        fetch(`/api/admin/delete/${userId}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` } 
        })
        .then(async res => {
            let data;
            try { data = await res.json(); } 
            catch (e) { data = { message: res.ok ? "Operación exitosa" : "Error de respuesta del servidor" }; }
            if (!res.ok) throw new Error(data.message || "Error al desactivar usuario");
            return data;
        })
        .then(() => showToastReload("Usuario desactivado"))
        .catch(err => showToast(err.message || "Error al desactivar usuario"));
    });
}

function activatedUser(userId) {
    const token = localStorage.getItem("token");
    if (!token) { showToastReload("Session expired. Please login again.", "/"); return; }

    showConfirmToast("¿Estás seguro que quieres activar este usuario?", confirmed => {
        if (!confirmed) return;

        fetch(`/api/admin/activate/${userId}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(async res => {
            let data;
            try { data = await res.json(); } 
            catch (e) { data = { message: res.ok ? "Operación exitosa" : "Error de respuesta del servidor" }; }
            if (!res.ok) throw new Error(data.message || "Error al activar usuario");
            return data;
        })
        .then(() => showToastReload("Usuario activado"))
        .catch(err => showToast(err.message || "Error al activar usuario"));
    });
}
function editUser(userId) { //nos lleva a la vista de edicion 
    window.location.href = `/api/admin/edit/${userId}`;
}

// function showSessionExpired() {
//     const modalEl = document.getElementById('sessionModal');
//     const modal = new bootstrap.Modal(modalEl);
//     modal.show();

//     const btn = document.getElementById('sessionAccept');
//     btn.onclick = () => {
//         modal.hide();
//         window.location.href = "/";
//     };
// }


//esto es lo que se inicializa al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        showToastReload("Session expired. Please login again.", "/");
        return;
    }

    //llamamos al endopint para obtener la informacion actual del usuario
    fetch("/api/admin/dashboard", { headers: { "Authorization": `Bearer ${token}` } })
    .then(async res => { 
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); 
            throw new Error(errorData.message || "Error en la petición");
        }
        return res.json(); 
    })
    .then(data => { 
        const usernameEl = document.getElementById("username");
        const adminSection = document.getElementById("adminSection");
        if (usernameEl) usernameEl.innerText = data.username;

        if (data.role === "admin" && adminSection) {
            adminSection.style.display = "block";

            fetch("/api/admin/get", { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(users => {
                const container = document.getElementById("usersCardsContainer");
                container.innerHTML = "";

                let allUsers = users;
                const searchInput = document.getElementById("searchInput");
                const roleFilter = document.getElementById("roleFilter");
                const statusFilter = document.getElementById("statusFilter");

                function renderUsers() {
                    const search = searchInput.value.toLowerCase();
                    const role = roleFilter.value;
                    const status = statusFilter.value;

                    const filtered = allUsers.filter(u => {
                        const matchesSearch = 
                            u.first_name.toLowerCase().includes(search) ||
                            u.last_name.toLowerCase().includes(search) ||
                            u.email.toLowerCase().includes(search) ||
                            u.username.toLowerCase().includes(search) ||
                            u.dni.toLowerCase().includes(search);

                        const matchesRole = role ? u.role === role : true;
                        const matchesStatus = status ? u.is_activate.toString() === status : true;

                        return matchesSearch && matchesRole && matchesStatus;
                    });

                    container.innerHTML = "";
                    if (filtered.length === 0) {
                        container.innerHTML = `<p class="text-center text-muted mt-3">No se encontraron usuarios.</p>`;
                        return;
                    }

                    filtered.forEach(u => {
                        const card = document.createElement("div"); 
                        card.className = "col-12 col-md-4 mb-3"; 
                        card.innerHTML = `
                        <div class="card h-100 text-center">
                            <img src="${u.photo ? `/static/uploads/${u.photo}` : '/static/default-avatar.png'}" 
                                 class="card-img-top mx-auto d-block mt-3 rounded-circle" 
                                 alt="Foto de ${u.first_name}" 
                                 style="width:120px; height:120px; object-fit:cover;">
                            <div class="card-body">
                                <h5 class="card-title">${u.first_name} ${u.last_name}</h5>
                                <p class="card-text text-start">
                                    <strong>Email:</strong> ${u.email}<br>
                                    <strong>Username:</strong> ${u.username}<br>
                                    <strong>Rol:</strong> ${u.role}<br>
                                    <strong>DNI:</strong> ${u.dni}<br>
                                    <strong>Fecha Nac.:</strong> ${u.birthdate}<br>
                                    <strong>Edad:</strong> ${u.age}<br>
                                    <strong>Celular:</strong> ${u.phone}<br>
                                    <strong>Nacionalidad:</strong> ${u.nationality}<br>
                                    <strong>Provincia:</strong> ${u.province}<br>
                                    <strong>Género:</strong> ${u.gender}<br>
                                    <strong>Activo:</strong> ${u.is_activate 
                                        ? '<span class="badge bg-success">Sí</span>'
                                        : '<span class="badge bg-secondary">No</span>'}
                                </p>
                                <div class="d-flex justify-content-center gap-2">
                                    <a class="btn btn-success btn-sm" href="/api/admin/edit/${u.id_user}">Editar</a>
                                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id_user}')">Desactivar</button>
                                    <button class="btn btn-sm btn-warning" onclick="activatedUser('${u.id_user}')">Activar</button>
                                </div>
                            </div>
                        </div>`;
                        container.appendChild(card);
                    });
                }

                searchInput.addEventListener("input", renderUsers);
                roleFilter.addEventListener("change", renderUsers);
                statusFilter.addEventListener("change", renderUsers);

                renderUsers();
            });
        }
    })
    .catch(err => {
    console.error(err);
    showToastReload("Session expired or unauthorized. Please login again.", "/");
    localStorage.clear();
});

});