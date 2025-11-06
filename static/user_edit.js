// =============================
// Función para mostrar toast
// =============================
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

// =============================
// Carga inicial del formulario
// =============================
document.addEventListener("DOMContentLoaded", async () => {

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

    // =============================
    // 🔹 Cargar JSON de países
    // =============================
    const countriesData = await fetch("/static/countries+states.json").then(res => res.json());
    countriesData.forEach(country => {
        const option = document.createElement("option");
        option.value = country.name;
        option.textContent = country.name;
        nationalitySelect.appendChild(option);
    });

    // 🔹 Función para llenar provincias
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

    // =============================
    // 🔹 Cargar datos del usuario
    // =============================
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
    if (role === "receptionist") {
    form.email.disabled = true; // no editable ni enviable
}

    if (user.nationality) {
        nationalitySelect.value = user.nationality;
        fillProvinces(user.nationality, user.province);
    }

    nationalitySelect.addEventListener("change", () => fillProvinces(nationalitySelect.value));

    // =============================
    // Envío del formulario
    // =============================
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const currentPassword = document.getElementById("current_password")?.value;
        const newPassword = document.getElementById("password")?.value;
        const repeatPassword = document.getElementById("repeat_password")?.value;

        const formData = new FormData(form);

        // Validaciones simples
        if (newPassword || repeatPassword || currentPassword) {
            if (!currentPassword) {
                showToastReload("⚠️ Debe ingresar la contraseña actual.");
                return;
            }
            if (!newPassword || !repeatPassword) {
                showToastReload("⚠️ Debe ingresar y repetir la nueva contraseña.");
                return;
            }
            if (newPassword !== repeatPassword) {
                passwordMsg.classList.remove("d-none");
                return;
            } else {
                passwordMsg.classList.add("d-none");
            }
            formData.delete("repeat_password");
        } else {
            formData.delete("current_password");
            formData.delete("password");
            formData.delete("repeat_password");
        }

        // =============================
        // Enviar al backend (Fetch)
        // =============================
        try {
    const res = await fetch(editEndpoint, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });

    let data = {};
    try {
        data = await res.json();
    } catch {
        showToastReload("⚠️ Respuesta inválida del servidor.");
        return;
    }

    // Si el servidor devolvió error HTTP (400, 500, etc.)
    if (!res.ok) {
        const msg = data.error 
            ? data.error 
            : Object.values(data).flat().join(", ") || "No se pudo actualizar.";
        showToastReload("⚠️ " + msg);
        return;
    }

    // Si la respuesta es correcta pero no contiene "message"
    const message = data.message || "Perfil actualizado correctamente.";
    showToastReload("✅ " + message, usersPage);

} catch (error) {
    showToastReload("❌ Error de conexión: " + error.message);
}

    });

// Mostrar / Ocultar contraseñas
const currentPasswordInput = document.getElementById("current_password");
const newPasswordInput = document.getElementById("password");
const repeatPasswordInput = document.getElementById("repeat_password");

const toggleCurrentPassword = document.getElementById("toggleCurrentPassword");
const toggleNewPassword = document.getElementById("toggleNewPassword");
const toggleRepeatPassword = document.getElementById("toggleRepeatPassword");

// Contraseña actual
if (toggleCurrentPassword && currentPasswordInput) {
    const icon = toggleCurrentPassword.querySelector("i");
    toggleCurrentPassword.addEventListener("click", () => {
        const isHidden = currentPasswordInput.type === "password";
        currentPasswordInput.type = isHidden ? "text" : "password";
        icon.classList.toggle("bi-eye", !isHidden);
        icon.classList.toggle("bi-eye-slash", isHidden);
    });
}

// Nueva contraseña
if (toggleNewPassword && newPasswordInput) {
    const icon = toggleNewPassword.querySelector("i");
    toggleNewPassword.addEventListener("click", () => {
        const isHidden = newPasswordInput.type === "password";
        newPasswordInput.type = isHidden ? "text" : "password";
        icon.classList.toggle("bi-eye", !isHidden);
        icon.classList.toggle("bi-eye-slash", isHidden);
    });
}

// Repetir contraseña
if (toggleRepeatPassword && repeatPasswordInput) {
    const icon = toggleRepeatPassword.querySelector("i");
    toggleRepeatPassword.addEventListener("click", () => {
        const isHidden = repeatPasswordInput.type === "password";
        repeatPasswordInput.type = isHidden ? "text" : "password";
        icon.classList.toggle("bi-eye", !isHidden);
        icon.classList.toggle("bi-eye-slash", isHidden);
    });
}
});


