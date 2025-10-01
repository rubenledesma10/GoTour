function deleteUser(userId) {
    const token = localStorage.getItem("token"); 
    if (!token) {
        alert("No token found, please login");
        return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    fetch(`/api/admin/delete/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(err => console.error(err));
}

function activatedUser(userId) {
    const token = localStorage.getItem("token"); 
    if (!token) {
        alert("No token found, please login");
        return;
    }

    if (!confirm("Are you sure you want to activate this user?")) return;

    fetch(`/api/admin/activate/${userId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(err => console.error(err));
}

function editUser(userId) {
    window.location.href = `/api/admin/edit/${userId}`;
}


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("No token encontrado, redirigiendo...");
        window.location.href = "/";
        return;
    }

    // Obtener datos del usuario logueado
    fetch("/api/admin/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(async res => {
        const text = await res.text();
        if (!res.ok) throw new Error(text);
        return JSON.parse(text);
    })
    .then(data => {
        const usernameEl = document.getElementById("username");
        const adminSection = document.getElementById("adminSection");

        if (usernameEl) usernameEl.innerText = data.username;

        if (data.role === "admin" && adminSection) {
            adminSection.style.display = "block";

            // Obtener lista de usuarios
            fetch("/api/admin/get", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(users => {
                const tbody = document.getElementById("usersTableBody");
                if (!tbody) return;

                tbody.innerHTML = "";
                users.forEach(u => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${u.first_name}</td>
                        <td>${u.last_name}</td>
                        <td>${u.email}</td>
                        <td>${u.username}</td>
                        <td>${u.role}</td>
                        <td>${u.dni}</td>
                        <td>${u.birthdate}</td>
                        <td>${u.phone}</td>
                        <td>${u.nationality}</td>
                        <td>${u.province}</td>
                        <td>${u.gender}</td>
                        <td>
                        ${u.is_activate 
                        ? '<span class="badge bg-success">Activo</span>' 
                        : '<span class="badge bg-secondary">Inactivo</span>'
                        }
                        </td>
                        <td>
                        <div class="d-grid gap-1" style="grid-template-columns: repeat(2, 1fr);">
                            <button class="btn btn-sm btn-success" onclick="editUser('${u.id_user}')">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id_user}')">Desactivar</button>
                            <button class="btn btn-sm btn-warning" onclick="activatedUser('${u.id_user}')">Activar</button>
                        </div>
                        </td>

                    `;
                    tbody.appendChild(row);
                });
            });
        }
    })
    .catch(err => {
        console.error("Error en users.js:", err);
        alert("Session expired or unauthorized. Please login again.");
        localStorage.clear();
        window.location.href = "/";
    });
});
