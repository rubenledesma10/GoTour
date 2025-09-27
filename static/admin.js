const token = localStorage.getItem("access_token");

if (!token) {
    window.location.href = "/";
}

// Fetch lista de usuarios
fetch("/api/admin/get", {
    headers: { "Authorization": `Bearer ${token}` }
})
    .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
    })
    .then(users => {
        const tbody = document.getElementById("usersTableBody");
        tbody.innerHTML = "";
        users.forEach(u => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${u.id_user}</td>
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
                <td>${u.is_activate}</td>
                <td>
                    <!-- Botones CRUD -->
                    <button class="btn btn-warning btn-sm">Editar</button>
                    <button class="btn btn-danger btn-sm" >Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(err => {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.clear();
        window.location.href = "/";
    });