document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ tourist_site_add.js con toasts cargado correctamente");

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        showToast("⚠️ Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/login";
        return;
    }

    if (role !== 'admin') {
        showToast("🚫 Acceso denegado. Solo los administradores pueden agregar sitios turísticos.");
        window.location.href = "/";
        return;
    }

    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }

    const addTouristSiteForm = document.getElementById('addTouristSiteForm');
    if (!addTouristSiteForm) return;

    // Envío del formulario

    addTouristSiteForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addTouristSiteForm);
        formData.append('is_activate', 'true');

        try {
            const response = await fetch('/api/add_tourist_sites', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            // ✅ Éxito
            if (response.ok) {
                showToast("✅ Sitio turístico agregado con éxito!", true, "/tourist_sites/view");
                return;
            }

            // ⚠️ Validaciones (Schema)
            if (result.errors) {
                const messages = Object.entries(result.errors)
                    .map(([field, msgs]) => `<strong>${field}:</strong> ${msgs.join(', ')}`)
                    .join('<br>');
                showToast(`⚠️ <b>Errores de validación:</b><br>${messages}`);
                return;
            }

            // ⚠️ Otros errores
            showToast(`⚠️ ${result.error || result.message || "Error desconocido"}`);

        } catch (error) {
            console.error("❌ Error:", error);
            showToast("❌ Error de red o del servidor al intentar agregar el sitio.");
        }
    });

    // Vista previa imagen

    const photoInput = document.getElementById('photo');
    const previewImage = document.getElementById('previewImage');

    if (photoInput && previewImage) {
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.style.display = 'none';
            }
        });
    }

    // Función Toast global
    
    function showToast(message, success = false, redirectUrl = null) {
        const toastEl = document.getElementById('liveToast');
        const toastMsg = document.getElementById('toastMessage');

        toastMsg.innerHTML = message;
        toastEl.className = `toast align-items-center border ${success ? 'border-success' : 'border-danger'}`;
        toastEl.style.backgroundColor = "#ffffff";
        toastEl.style.color = "#000";
        toastEl.style.borderRadius = "0.5rem";
        toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

        const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        toast.show();

        if (redirectUrl) {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        }
    }
});
