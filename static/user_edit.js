document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
        return;
    }

    const role = localStorage.getItem("role");

    // Endpoints según el rol
    const userEndpoint = role === "receptionist" 
        ? "/api/recepcionist/get" 
        : "/api/tourist/get";

    const editEndpoint = role === "receptionist" 
        ? "/api/recepcionist/my_data/edit" 
        : "/api/tourist/my_data/edit";

    const usersPage = role === "receptionist" 
        ? "/api/recepcionist/users_page" 
        : "/api/tourist/users_page";

    const form = document.getElementById("editUserForm");
    if (!form) return; // Si no hay formulario, salimos

    // 1️⃣ Obtener los datos actuales del usuario y rellenar el formulario
    fetch(userEndpoint, { headers: { "Authorization": `Bearer ${token}` } })
    .then(res => res.json())
    .then(user => {
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
    })
    .catch(err => {
        console.error("Error al cargar usuario", err);
        alert("No se pudieron cargar tus datos.");
    });

    // 2️⃣ Manejar envío del formulario
    form.addEventListener("submit", e => {
        e.preventDefault();

        const formData = new FormData(form);

        // Si no se completó password, no lo enviamos
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
});
