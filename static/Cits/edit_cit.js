document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const body = document.getElementById("protectedBody");

    if (body) body.style.display = "block";

    if (!token) {
        showToastReload("⚠️ Debes iniciar sesión para editar CITs.", "/login");
        return;
    }

    if (role !== "admin") {
        showToastReload("❌ No tienes permisos para editar CITs.", "/cit/view");
        return;
    }

    const editForm = document.getElementById("editCitForm");
    if (!editForm) {
        console.error("⚠️ No se encontró el formulario de edición.");
        showToast("⚠️ Error interno: no se encontró el formulario.");
        return;
    }

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const citId = editForm.dataset.id;
        if (!citId) {
            showToast("⚠️ No se encontró el ID del CIT.");
            return;
        }

        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        // Convertir checkboxes a booleanos
        data.is_activate = formData.get("is_activate") ? "true" : "false";
        data.is_activate_qr_map = formData.get("is_activate_qr_map") ? "true" : "false";

        try {
            const response = await fetch(`/api/${citId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("📦 Resultado del servidor:", result);

            if (response.ok) {
                showToastReload("✅ CIT actualizado correctamente.", "/cit/view");
            } else {
                showToast("❌ Error al actualizar: " + (result.error || result.message));
            }
        } catch (error) {
            console.error("⚠️ Error al editar:", error);
            showToast("⚠️ No se pudo conectar con el servidor.");
        }
    });

    // =================== FUNCIONES TOAST =====================

    function showToast(message, duration = 5000) {
        const toastEl = document.getElementById('liveToast');
        const toastMessage = document.getElementById('toastMessage');

        toastMessage.textContent = message;

        toastEl.className = `toast align-items-center border border-secondary`;
        toastEl.style.backgroundColor = "#ffffff";
        toastEl.style.color = "#000000";
        toastEl.style.borderRadius = "0.5rem";
        toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: duration });
        toast.show();
    }

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

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: false });
        toast.show();

        const acceptBtn = document.getElementById('toastAccept');
        acceptBtn.addEventListener('click', () => {
            toast.hide();
            if (redirectUrl) window.location.href = redirectUrl;
        });
    }
});
