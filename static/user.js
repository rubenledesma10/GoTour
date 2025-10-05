function deleteUser(userId) {
    const token = localStorage.getItem("token"); 
    if (!token) { 
        alert("No token found, please login");
        return;
    }

    if (!confirm("Are you sure you want to deactivate your account?")) return;

    fetch(`/api/tourist/delete/${userId}`, { 
        method: "DELETE", 
        headers: { "Authorization": `Bearer ${token}` } 
    })
    .then(res => {
        // La promesa de fetch solo falla por error de red. 
        // Si el código es 4xx o 5xx, pasa aquí, pero res.ok es false.
        
        // 1. Intentamos leer el JSON en CUALQUIER caso (éxito o error de API)
        return res.json().then(data => ({ status: res.status, ok: res.ok, data }));
    })
    .then(({ status, ok, data }) => {
        
        if (ok) { // Éxito: Código 200
            alert(data.message);
            
            // LÓGICA DE CIERRE DE SESIÓN
            localStorage.clear(); 
            window.location.href = "/"; 
            
        } else {
            // Manejo de errores de la API (401, 403, 404, 500)
            const errorMessage = data.message || data.error || `Error ${status} al desactivar.`;
            alert("Deactivation failed: " + errorMessage);
        }
    })
    .catch(err => {
        // Este catch solo atrapará errores de red o errores de JavaScript internos.
        console.error("Fetch/Network Error:", err);
        alert("A network or server error occurred. Check console for details.");
    });
}
//esto es lo que se inicializa al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token"); //obtenemos el token

    if (!token) {
        window.location.href = "/"; // si el token no esta, nos lleva al index
        return;
    }

    //llamamos al endopint para obtener la informacion actual del usuario
    fetch("/api/tourist/dashboard", { headers: { "Authorization": `Bearer ${token}` } })
    .then(async res => { //leemos la respuesta del servidor
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); //capatamos el error
            throw new Error(errorData.message || "Error en la petición");
        }
        return res.json(); //obtenemos la respuesta exitosa del back
    })
    .then(data => { //info del usuario
        const usernameEl = document.getElementById("username");
        const userSection = document.getElementById("userSection");
        if (usernameEl) usernameEl.innerText = data.username;

        if (data.role === "tourist" && userSection) {
            userSection.style.display = "block";

            fetch("/api/tourist/get", { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener datos del turista");
                return res.json();
            })
            .then(user => { // ⬅️ La respuesta es UN solo objeto 'user', no una lista
                const container = document.getElementById("usersCards"); // O un ID más apropiado, como 'touristProfile'
                if (!container) return;
                
                // 2. Limpiar el contenedor y generar la vista de perfil
                container.innerHTML = "";

                // Generamos una sola Card o Div para los datos
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
                                    
                                    
                                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id_user}')">Desactivar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML = userCardHTML; // Inyectar el HTML del perfil

                // Opcional: Si tienes un modal de edición, aquí puedes precargar los datos.
                // populateEditForm(user); 
            })
            .catch(error => {
                console.error("Error al obtener datos del turista:", error);
                container.innerHTML = `<p class="text-danger">No se pudieron cargar sus datos de perfil.</p>`;
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