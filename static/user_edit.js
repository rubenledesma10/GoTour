document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
        return;
    }

    // 1. Obtener los datos actuales del usuario
    fetch("/api/tourist/get", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(user => {
        // rellenar los campos del formulario
        document.getElementById("first_name").value = user.first_name || "";
        document.getElementById("last_name").value = user.last_name || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("username").value = user.username || "";
        document.getElementById("dni").value = user.dni || "";
        document.getElementById("birthdate").value = user.birthdate || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("nationality").value = user.nationality || "";
        document.getElementById("province").value = user.province || "";
        document.getElementById("gender").value = user.gender || "";
    })
    .catch(err => {
        console.error("Error al cargar usuario", err);
        alert("No se pudieron cargar tus datos.");
    });

    // 2. Manejar el envío del formulario
    const form = document.getElementById("editUserForm");
    form.addEventListener("submit", e => {
        e.preventDefault();
        
        const formData = new FormData(form);

        // si el usuario no completó password, no lo enviamos
        if (!formData.get("password")) {
            formData.delete("password");
        }

        fetch("/api/tourist/my_data/edit", {
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
                window.location.href = "/api/tourist/users_page"; // volver a la card
            }
        })
        .catch(err => {
            console.error("Error en actualización:", err);
            alert("Error de red o servidor.");
        });
    });
});
