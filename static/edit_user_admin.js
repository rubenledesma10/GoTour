// Función para mostrar un toast que recarga/redirige al cerrarse
function showToastReload(message, redirectUrl = null) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message} 
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    // Fondo blanco, texto negro y borde
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

// Script de edición de usuario
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editUserForm");
    if (!form) return;

    const userId = form.dataset.userId;
    const token = localStorage.getItem("token");

    const nationalitySelect = document.getElementById("nationality");
    const provinceSelect = document.getElementById("province");

    // ✅ Traemos los valores del usuario desde el HTML (data attributes)
    const currentNationality = form.dataset.nationality;
    const currentProvince = form.dataset.province;

    // Función para llenar provincias según país
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

        if (selectedProvince) {
            provinceSelect.value = selectedProvince;
        }
    }

    // Cargar JSON de países y provincias
    fetch("/static/countries+states.json")
        .then(res => res.json())
        .then(data => {
            window.countriesData = data;

            // Llenar select de países
            data.forEach(country => {
                const option = document.createElement("option");
                option.value = country.name;
                option.textContent = country.name;
                nationalitySelect.appendChild(option);
            });

            // ✅ Seleccionar automáticamente los valores del usuario
            nationalitySelect.value = currentNationality;
            fillProvinces(currentNationality, currentProvince);
        })
        .catch(err => console.error("Error cargando países:", err));

    // Cuando cambia el país, actualizar provincias
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

            if (!res.ok) {
                let mensaje = data.error || "Ocurrió un error";
                showToastReload(mensaje);
                return;
            }

            showToastReload("Usuario editado correctamente", "/api/admin/users_page");
        } catch (err) {
            console.error("Error en edición:", err);
            showToastReload("Error: " + err.message);
        }
    });
});
