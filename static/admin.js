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
                            <button class="btn btn-sm btn-primary me-1">Edit</button>
                            <button class="btn btn-sm btn-danger">Delete</button>
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
