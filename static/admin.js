function deleteUser(userId) { //desactivar usuario. le pasamos el id del usuario a desactivar desde onclick
    const token = localStorage.getItem("token"); //guardamos el token de localstorage
    if (!token) { //validamos si hay token
        alert("No token found, please login");
        return;
    }

    if (!confirm("Are you sure you want to deactivate this user?")) return; //cartel para confirmar si queremos eliminarlo

    fetch(`/api/admin/delete/${userId}`, { //apuntamos al back
        method: "DELETE", //le decimos que metodo es 
        headers: { "Authorization": `Bearer ${token}` } //mandamos el token por la cabecera
    })
    .then(res => res.json()) //devuelve repuesta del back
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(err => console.error(err)); //captura si hay algun error
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

function editUser(userId) { //nos lleva a la vista de edicion 
    window.location.href = `/api/admin/edit/${userId}`;
}

//esto es lo que se inicializa al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token"); //obtenemos el token

    if (!token) {
        window.location.href = "/"; // si el token no esta, nos lleva al index
        return;
    }

    //llamamos al endopint para obtener la informacion actual del usuario
    fetch("/api/admin/dashboard", { headers: { "Authorization": `Bearer ${token}` } })
    .then(async res => { //leemos la respuesta del servidor
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); //capatamos el error
            throw new Error(errorData.message || "Error en la petición");
        }
        return res.json(); //obtenemos la respuesta exitosa del back
    })
    .then(data => { //info del usuario
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
    const card = document.createElement("div"); //creamos un div que va a tener las cards
    card.className = "col-md-4 mb-3"; //estilso de bootrstrap
    //creamos la card
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
    container.appendChild(card); //aca se añade la card
});

            });
        }
    }) //capturamos errores
    .catch(err => {
        console.error(err);
        alert("Session expired or unauthorized. Please login again.");
        localStorage.clear();
        window.location.href = "/";
    });
});
