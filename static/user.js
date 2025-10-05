// Función para desactivar/eliminar usuario
function deleteUser(userId) {
    const token = localStorage.getItem("token"); 
    if (!token) { 
        alert("No token found, please login");
        return;
    }

    if (!confirm("¿Seguro que querés desactivar tu cuenta?")) return;

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
            alert(data.message);
            localStorage.clear(); 
            window.location.href = "/"; 
        } else {
            const errorMessage = data.message || data.error || `Error ${status} al desactivar.`;
            alert("Error al desactivar: " + errorMessage);
        }
    })
    .catch(err => {
        console.error("Fetch/Network Error:", err);
        alert("Error de red o del servidor.");
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

    // 1️⃣ Obtener información de dashboard
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

        // 2️⃣ Obtener información del usuario
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
                <div class="col-md-8 mx-auto">
                    <div class="card h-100 p-4 text-center">
                        <img src="${user.photo ? `/static/uploads/${user.photo}` : '/static/default-avatar.png'}" 
                             class="card-img-top mx-auto d-block mt-3 rounded-circle" 
                             alt="Foto de ${user.first_name}" 
                             style="width:150px; height:150px; object-fit:cover;">
                        <div class="card-body">
                            <h5 class="card-title">${user.first_name} ${user.last_name}</h5>
                            <p class="card-text text-start mx-auto" style="max-width: 400px;">
                                <strong>Email:</strong> ${user.email}<br>
                                <strong>Username:</strong> ${user.username}<br>
                                <strong>DNI:</strong> ${user.dni}<br>
                                <strong>Fecha Nac.:</strong> ${user.birthdate}<br>
                                <strong>Celular:</strong> ${user.phone}<br>
                                <strong>Nacionalidad:</strong> ${user.nationality}<br>
                                <strong>Provincia:</strong> ${user.province}<br>
                                <strong>Género:</strong> ${user.gender}<br>
                                <strong>Rol:</strong> ${user.role}<br>
                            </p>
                            <div class="mt-3 d-flex justify-content-center gap-3">
                                <a href="${editPage}" class="btn btn-sm btn-success text-white">Editar Perfil</a>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id_user}')">Desactivar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = userCardHTML;

            // 3️⃣ Si existe el formulario de edición, rellenamos los campos
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
                            alert("Error: " + data.error);
                        } else {
                            alert("Perfil actualizado correctamente ✅");
                            window.location.href = usersPage;
                        }
                    })
                    .catch(err => {
                        console.error("Error en actualización:", err);
                        alert("Error de red o servidor.");
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
        alert("Sesión expirada o no autorizada. Inicie sesión nuevamente.");
        localStorage.clear();
        window.location.href = "/";
    });
});
