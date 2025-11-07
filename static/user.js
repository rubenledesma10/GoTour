// Función para mostrar un toast normal
function showToast(message, duration = 5000) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    // Fondo blanco, texto negro y borde
    toastEl.className = `toast align-items-center border border-secondary`;
    toastEl.style.backgroundColor = "#ffffff";
    toastEl.style.color = "#000000";
    toastEl.style.borderRadius = "0.5rem";
    toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

    const toast = new bootstrap.Toast(toastEl, { delay: duration });
    toast.show();
}

// Función para mostrar un toast de confirmación
function showConfirmToast(message, callback) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message} 
        <div class="mt-2">
            <button id="confirmYes" class="btn btn-sm btn-success me-2">Sí</button>
            <button id="confirmNo" class="btn btn-sm btn-secondary">No</button>
        </div>
    `;

    // Fondo blanco, texto negro y borde
    toastEl.className = `toast align-items-center border border-secondary`;
    toastEl.style.backgroundColor = "#ffffff";
    toastEl.style.color = "#000000";
    toastEl.style.borderRadius = "0.5rem";
    toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

    const toast = new bootstrap.Toast(toastEl, { autohide: false });
    toast.show();

    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    yesBtn.addEventListener('click', () => {
        toast.hide();
        callback(true);
    });

    noBtn.addEventListener('click', () => {
        toast.hide();
        callback(false);
    });
}

// Función para mostrar un toast que recarga la página al cerrarse
function showToastReload(message) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message} 
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    // Fondo blanco, texto negro y borde
    toastEl.className = `toast align-items-center border border-secondary`;
    toastEl.style.backgroundColor = "#ffffff";
    toastEl.style.color = "#000000";
    toastEl.style.borderRadius = "0.5rem";
    toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

    const toast = new bootstrap.Toast(toastEl, { autohide: false });
    toast.show();

    const acceptBtn = document.getElementById('toastAccept');
    acceptBtn.addEventListener('click', () => {
        toast.hide();
        location.href = "/"; // Redirige al home después de aceptar
    });
}

// Función para desactivar/eliminar usuario
function deleteUser(userId) {
    const token = localStorage.getItem("token"); 
    if (!token) { 
        showToast("No token found, please login", 5000);
        return;
    }

    // Confirmación usando toast
    showConfirmToast("Are you sure you want to deactivate your account?", confirmed => {
        if (!confirmed) return;

        const role = localStorage.getItem("role");
        const deleteEndpoint = role === "receptionist" 
            ? `/api/recepcionist/delete/${userId}`
            : `/api/tourist/delete/${userId}`;

        fetch(deleteEndpoint, { 
            method: "DELETE", 
            headers: { "Authorization": `Bearer ${token}` } 
        })
        .then(res => res.json().then(data => ({ status: res.status, ok: res.ok, data })))
        .then(({ status, ok, data }) => {
            if (ok) {
                showToastReload(data.message || "Usuario desactivado ✅");
                localStorage.clear(); 
            } else {
                const errorMessage = data.message || data.error || `Error ${status} deactivating:`;
                showToast("Error deactivating: " + errorMessage, 5000);
            }
        })
        .catch(err => {
            console.error("Fetch/Network Error:", err);
            showToast("Error de red o del servidor.", 5000);
        });
    });
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
        return;
    }

    const role = localStorage.getItem("role");

    // Endpoints según rol
    const dashboardEndpoint = role === "receptionist" ? "/api/recepcionist/dashboard" : "/api/tourist/dashboard";
    const userEndpoint = role === "receptionist" ? "/api/recepcionist/get" : "/api/tourist/get";
    const editPage = role === "receptionist" ? "/api/recepcionist/edit_page" : "/api/tourist/edit_page";
    const editEndpoint = role === "receptionist" ? "/api/recepcionist/my_data/edit" : "/api/tourist/my_data/edit";
    const usersPage = role === "receptionist" ? "/api/recepcionist/users_page" : "/api/tourist/users_page";

    // Obtener información de dashboard
    fetch(dashboardEndpoint, { headers: { "Authorization": `Bearer ${token}` } })
    .then(async res => {
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Error en la petición");
        }
        return res.json();
    })
    .then(data => {
        const usernameEl = document.getElementById("username");
        const userSection = document.getElementById("userSection");
        if (usernameEl) usernameEl.innerText = data.username;
        if (!userSection) return;

        userSection.style.display = "block";

        // Obtener información del usuario
        fetch(userEndpoint, { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => {
            if (!res.ok) throw new Error("Error al obtener datos del usuario");
            return res.json();
        })
        .then(user => {
            const container = document.getElementById("usersCards");
            if (!container) return;
            container.innerHTML = "";

            // Generamos la card del usuario
            const userCardHTML = `
                <div class="col-md-6 col-lg-5 mx-auto">
                    <div class="card shadow-sm border-0 text-center p-3" style="max-width: 400px; margin: auto;">
                        <img src="${user.photo ? `/static/uploads/${user.photo}` : '/static/default-avatar.png'}" 
                             class="rounded-circle mx-auto mt-3 mb-2" 
                             alt="Foto de ${user.first_name}" 
                             style="width:120px; height:120px; object-fit:cover; border: 3px solid #f0f0f0;">
                        
                        <div class="card-body">
                            <h5 class="card-title mb-1">${user.first_name} ${user.last_name}</h5>
                            <p class="text-muted mb-3">${user.role}</p>

                            <div class="text-start mx-auto" style="max-width: 300px; font-size: 0.9rem;">
                                <strong>Email:</strong> ${user.email}<br>
                                <strong>Username:</strong> ${user.username}<br>
                                <strong>DNI:</strong> ${user.dni}<br>
                                <strong>Fecha Nac.:</strong> ${user.birthdate}<br>
                                <strong>Edad:</strong> ${user.age}<br>
                                <strong>Celular:</strong> ${user.phone}<br>
                                <strong>Nacionalidad:</strong> ${user.nationality}<br>
                                <strong>Provincia:</strong> ${user.province}<br>
                                <strong>Género:</strong> ${user.gender}<br>
                            </div>

                            <div class="mt-3 d-flex justify-content-center gap-2">
                                <a href="${editPage}" class="btn btn-sm btn-success">Editar Perfil</a>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id_user}')">Desactivar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = userCardHTML;

            // Si existe el formulario de edición, rellenamos los campos
            const form = document.getElementById("editUserForm");
            if (form) {
                form.first_name.value = user.first_name || "";
                form.last_name.value = user.last_name || "";
                form.email.value = user.email || "";
                form.username.value = user.username || "";
                form.dni.value = user.dni || "";
                form.birthdate.value = user.birthdate || "";
                form.phone.value = user.phone || "";
                form.nationality.value = user.nationality || "";
                form.province.value = user.province || "";
                form.gender.value = user.gender || "";

                form.addEventListener("submit", e => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    if (!formData.get("password")) formData.delete("password");

                    fetch(editEndpoint, {
                        method: "PUT",
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            showToast("Error: " + data.error, 5000);
                        } else {
                            showToastReload("Perfil actualizado correctamente ✅");
                        }
                    })
                    .catch(err => {
                        console.error("Error en actualización:", err);
                        showToast("Error de red o servidor.", 5000);
                    });
                });
            }
        })
        .catch(error => {
            console.error("Error al obtener datos del usuario:", error);
            const container = document.getElementById("usersCards");
            if (container) container.innerHTML = `<p class="text-danger">No se pudieron cargar sus datos de perfil.</p>`;
        });
    })
    .catch(err => {
        console.error(err);
        showToast("Sesión expirada o no autorizada. Inicie sesión nuevamente.", 5000);
        localStorage.clear();
        window.location.href = "/";
    });
});
