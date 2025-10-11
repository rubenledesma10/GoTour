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

    // Nacionalidad + provincia
    if (user.nationality) {
        nationalitySelect.value = user.nationality;
        fillProvinces(user.nationality, user.province);
    }

    if (role === "receptionist") {
        form.email.setAttribute("disabled", "true");
    }

    // Cambiar provincias al cambiar país
    nationalitySelect.addEventListener("change", () => fillProvinces(nationalitySelect.value));

    // Envío del formulario
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const formData = new FormData(form);
        if (!formData.get("password")) formData.delete("password");

        const res = await fetch(editEndpoint, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (!res.ok || data.error) {
            showToastReload("Error: " + (data.error || "No se pudo actualizar"));
        } else {
            showToastReload("Perfil actualizado correctamente ✅", usersPage);
        }

    });
});
