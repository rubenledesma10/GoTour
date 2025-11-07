document.addEventListener('DOMContentLoaded', () => {
    console.log("add_cit.js cargado correctamente");

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        showToast("⚠️ Debes iniciar sesión para acceder a esta página.", 3000, () => {
            window.location.href = "/api/gotour/login";
        });
        return;
    }

    if (role !== 'admin') {
        showToast("🚫 Acceso denegado. Solo los administradores pueden agregar CITs.", 3000, () => {
            window.location.href = "/";
        });
        return;
    }

    const createForm = document.getElementById('create-cit-form');
    if (!createForm) return;

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(createForm);

        // Agregamos el estado activo del CIT
        formData.set("is_activate_cit", document.getElementById("is_activate_cit").checked ? "true" : "false");

        console.log("Token enviado:", token);
        console.log("Datos del formulario:", Object.fromEntries(formData.entries()));

        try {
            const response = await fetch('/api/add_cit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showToast("✅ CIT agregado con éxito!", 2000, () => {
                    window.location.href = '/cit/view';
                });
            } else {
                showToast("⚠️ Error al agregar el CIT: " + (result.error || result.message), 5000);
            }
        } catch (error) {
            console.error('❌ Error de red o del servidor:', error);
            showToast("❌ Ocurrió un error al intentar agregar el CIT.", 5000);
        }
    });

    // =================== FUNCION TOAST =====================
    function showToast(message, duration = 5000, callback = null) {
        // Creamos el toast dinámicamente si no existe
        let toastEl = document.getElementById('liveToast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'liveToast';
            toastEl.className = 'toast';
            toastEl.setAttribute('role', 'alert');
            toastEl.style.position = 'fixed';
            toastEl.style.top = '1rem';
            toastEl.style.right = '1rem';
            toastEl.style.zIndex = '9999';
            toastEl.innerHTML = `<div class="toast-body" id="toastMessage"></div>`;
            document.body.appendChild(toastEl);
        }

        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;

        toastEl.className = `toast align-items-center border border-secondary`;
        toastEl.style.backgroundColor = "#ffffff";
        toastEl.style.color = "#000000";
        toastEl.style.borderRadius = "0.5rem";
        toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: duration });
        toast.show();

        if (callback) {
            setTimeout(callback, duration);
        }
    }
});
