function deleteUser(userId) {
    const token = localStorage.getItem("token"); 
    if (!token) {
        alert("No token found, please login");
        return;
    }

    if (!confirm("Are you sure you want to desactivated this user?")) return;

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
        window.location.href = "/";
        return;
    }

    fetch("/api/admin/dashboard", { headers: { "Authorization": `Bearer ${token}` } })
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

            fetch("/api/admin/get", { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(users => {
                const container = document.getElementById("usersCardsContainer");
                container.innerHTML = "";
users.forEach(u => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";
    card.innerHTML = `
    <div class="card h-100 text-center">
        <!-- Imagen del usuario centrada y responsiva -->
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
    </div>
`;
    container.appendChild(card);
});

            });
        }
    })
    .catch(err => {
        console.error(err);
        alert("Session expired or unauthorized. Please login again.");
        localStorage.clear();
        window.location.href = "/";
    });
});
