// Mostrar toast personalizado
function showToastReload(message, redirectUrl = null) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message}
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    toastEl.className = `toast align-items-center border border-secondary`;
    toastEl.style.backgroundColor = "#ffffff";
    toastEl.style.color = "#000000";
    toastEl.style.borderRadius = "0.5rem";
    toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

    const toast = new bootstrap.Toast(toastEl, { autohide: false });
    toast.show();

    document.getElementById('toastAccept').addEventListener('click', () => {
        toast.hide();
        redirectUrl ? window.location.href = redirectUrl : window.location.reload();
    });
}

document.addEventListener("DOMContentLoaded", async () => {

    // --- TOGGLE PASSWORD ---
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;
            togglePassword.innerHTML = type === "password"
                ? '<i class="bi bi-eye fs-5"></i>'
                : '<i class="bi bi-eye-slash fs-5"></i>';
        });
    }

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
        return;
    }

    const role = localStorage.getItem("role");
    const userEndpoint = role === "receptionist" ? "/api/recepcionist/get" : "/api/tourist/get";
    const editEndpoint = role === "receptionist" ? "/api/recepcionist/my_data/edit" : "/api/tourist/my_data/edit";
    const usersPage = role === "receptionist" ? "/api/recepcionist/users_page" : "/api/tourist/users_page";

    const form = document.getElementById("editUserForm");
    const nationalitySelect = document.getElementById("nationality");
    const provinceSelect = document.getElementById("province");
    const passwordMsg = document.getElementById("passwordMatchMsg");

    // Cargar JSON de países
    const countriesData = await fetch("/static/countries+states.json").then(res => res.json());
    window.countriesData = countriesData;

    countriesData.forEach(country => {
        const option = document.createElement("option");
        option.value = country.name;
        option.textContent = country.name;
        nationalitySelect.appendChild(option);
    });

    // Función para llenar provincias
    function fillProvinces(countryName, selectedProvince = null) {
        provinceSelect.innerHTML = '<option value="" disabled>Seleccione una provincia</option>';
        const country = countriesData.find(c => c.name === countryName);
        if (!country) return;
        country.states.forEach(state => {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            provinceSelect.appendChild(option);
        });
        if (selectedProvince) provinceSelect.value = selectedProvince;
    }

    // Cargar datos del usuario
    const user = await fetch(userEndpoint, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json());

    form.first_name.value = user.first_name || "";
    form.last_name.value = user.last_name || "";
    form.email.value = user.email || "";
    form.username.value = user.username || "";
    form.dni.value = user.dni || "";
    form.birthdate.value = user.birthdate || "";
    form.phone.value = user.phone || "";
    form.gender.value = user.gender || "";
    form.age.value = user.age || "";

    if (user.nationality) {
        nationalitySelect.value = user.nationality;
        fillProvinces(user.nationality, user.province);
    }

    if (role === "receptionist") {
        form.email.setAttribute("disabled", "true");
    }

    nationalitySelect.addEventListener("change", () => fillProvinces(nationalitySelect.value));

    // Envío del formulario
 // Envío del formulario
form.addEventListener("submit", async e => {
    e.preventDefault();

    const currentPassword = document.getElementById("current_password")?.value;
    const newPassword = document.getElementById("password")?.value;
    const repeatPassword = document.getElementById("repeat_password")?.value;
    
    // Crear FormData solo con campos válidos
    const formData = new FormData(form);

    // Lógica para el cambio de contraseña
    if (newPassword || repeatPassword || currentPassword) {
        // Al menos uno de los campos de contraseña está siendo tocado
        
        // 1. Validar que se ingrese la contraseña actual
        if (!currentPassword) {
            showToastReload("Debe ingresar la **contraseña actual** para cambiarla.");
            return;
        }

        // 2. Validar que la nueva contraseña y su repetición estén presentes
        if (!newPassword || !repeatPassword) {
            showToastReload("Debe ingresar la **nueva contraseña** y **repetirla**.");
            return;
        }

        // 3. Validar que la nueva contraseña coincida con la repetición
        if (newPassword !== repeatPassword) {
            passwordMsg.classList.remove("d-none"); // Muestra el mensaje de error
            return;
        } else {
            passwordMsg.classList.add("d-none"); // Oculta el mensaje si coinciden
        }

        // Si todas las validaciones pasan, se incluye 'password' y 'current_password' en formData.
        // formData ya contiene 'current_password', 'password' y 'repeat_password' de la estructura del formulario.
        // Solo necesitamos eliminar 'repeat_password'.
        formData.delete("repeat_password");

        // Nota: El backend será el encargado de validar si 'current_password' es correcta.

    } else {
        // NO se está cambiando la contraseña, solo otros datos.
        
        // Eliminamos todos los campos relacionados con la contraseña para que el backend NO intente procesarlos.
        formData.delete("current_password");
        formData.delete("password");
        formData.delete("repeat_password");
        
        // Importante: Si el campo 'password' está vacío, algunos frameworks de backend pueden
        // intentar establecer un hash de una cadena vacía, lo cual no es lo deseado.
        // Asegurémonos de que solo se envíen si hay un valor válido.
    }

    try {
        const res = await fetch(editEndpoint, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();

        if (!res.ok || data.error) {
            // Manejo de error específico si el backend indica que la contraseña actual es incorrecta
            if (data.error && data.error.includes("contraseña actual")) {
                showToastReload("Error: La **contraseña actual** ingresada es incorrecta.");
            } else {
                showToastReload("Error: " + (data.error || "No se pudo actualizar."));
            }
        } else {
            // Redirección o recarga tras el éxito.
            showToastReload("Perfil actualizado correctamente ✅", usersPage);
        }
    } catch (error) {
        showToastReload("Error de conexión: " + error.message);
    }
});
});
