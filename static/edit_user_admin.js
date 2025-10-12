// =======================================
// Función para mostrar un toast con recarga/redirección
// =======================================
function showToastReload(message, redirectUrl = null) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message} 
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    // Estilos visuales
    toastEl.className = `toast align-items-center border border-secondary`;
    toastEl.style.backgroundColor = "#ffffff";
    toastEl.style.color = "#000000";
    toastEl.style.borderRadius = "0.5rem";
    toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

    const toast = new bootstrap.Toast(toastEl, { autohide: false });
    toast.show();

    document.getElementById('toastAccept').addEventListener('click', () => {
        toast.hide();
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.location.reload();
        }
    });
}

// =======================================
// Script de edición de usuario (adaptado como register)
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editUserForm");
    if (!form) return;

    const userId = form.dataset.userId;
    const token = localStorage.getItem("token");

    const nationalitySelect = document.getElementById("nationality");
    const provinceSelect = document.getElementById("province");
    const currentNationality = form.dataset.nationality;
    const currentProvince = form.dataset.province;

    // Cargar países y provincias
    fetch("/static/countries+states.json")
        .then(res => res.json())
        .then(data => {
            window.countriesData = data;
            data.forEach(country => {
                const option = document.createElement("option");
                option.value = country.name;
                option.textContent = country.name;
                nationalitySelect.appendChild(option);
            });

            nationalitySelect.value = currentNationality;
            fillProvinces(currentNationality, currentProvince);
        })
        .catch(err => console.error("Error cargando países:", err));

    function fillProvinces(countryName, selectedProvince = null) {
        provinceSelect.innerHTML = '<option value="" disabled>Seleccione una provincia</option>';
        const country = window.countriesData.find(c => c.name === countryName);
        if (!country) return;

        country.states.forEach(state => {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            provinceSelect.appendChild(option);
        });

        if (selectedProvince) provinceSelect.value = selectedProvince;
    }

    nationalitySelect.addEventListener("change", () => {
        fillProvinces(nationalitySelect.value);
    });

    // Envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch(`/api/admin/edit/${userId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                showToastReload(data.message || "Usuario editado correctamente ✅", "/api/admin/users_page");
            } else {
                showToastReload(data.error || "Error al editar el usuario ❌");
            }
        } catch (error) {
            console.error("Error:", error);
            showToastReload("Error en el servidor ❌");
        }
    });
});