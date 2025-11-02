document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (body) body.style.display = 'block';

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    console.log("✅ Página de CITs cargada correctamente. Rol:", role);

    // ==========================================================
    // BOTONES ACTIVAR / DESACTIVAR
    const buttons = document.querySelectorAll('.btnToggle');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const citId = button.dataset.id;
            const action = button.dataset.action;

            if (!citId) {
                showToast("⚠️ No se encontró el ID del CIT.");
                return;
            }

            const confirmMsg = action === 'deactivate'
                ? "¿Deseas desactivar este CIT?"
                : "¿Deseas reactivar este CIT?";

            showConfirmToast(confirmMsg, async (confirmed) => {
                if (!confirmed) return;

                try {
                    const url = action === 'deactivate'
                        ? `/api/cit/${citId}`
                        : `/api/cit/${citId}/reactivate`;

                    const method = action === 'deactivate' ? 'DELETE' : 'PUT';

                    console.log(`➡️ Enviando ${method} a ${url}`);

                    const response = await fetch(url, {
                        method,
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const result = await response.json();
                    console.log("📦 Respuesta del servidor:", result);

                    if (response.ok) {
                        const successMsg = action === 'deactivate'
                            ? '🗑️ CIT desactivado correctamente.'
                            : '✅ CIT reactivado correctamente.';

                        showToastReload(successMsg, 1500); // recarga automática después de 1.5s
                    } else {
                        showToast("❌ Error: " + (result.error || result.message));
                    }

                } catch (error) {
                    console.error("⚠️ Error al conectar con el servidor:", error);
                    showToast("⚠️ Error al conectar con el servidor.");
                }
            });
        });
    });

    // ==========================================================
    // BOTÓN EDITAR
    const editButtons = document.querySelectorAll(".btnEdit");

    editButtons.forEach(button => {
        button.addEventListener("click", () => {
            const citId = button.dataset.id;

            if (!citId) {
                showToast("⚠️ No se encontró el ID del CIT para editar.");
                return;
            }

            console.log(`✏️ Redirigiendo a /cit/edit/${citId}`);
            window.location.href = `/cit/edit/${citId}`;
        });
    });

    // ==========================================================
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

    function showToastReload(message, duration = 2000) {
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
            window.location.reload();
        });

        // Recargar automáticamente después de X ms
        setTimeout(() => {
            toast.hide();
            window.location.reload();
        }, duration);
    }

    function showConfirmToast(message, callback) {
        const toastEl = document.getElementById('liveToast');
        const toastMessage = document.getElementById('toastMessage');

        toastMessage.innerHTML = `
            ${message}
            <div class="mt-2 text-center">
                <button id="toastConfirm" class="btn btn-success btn-sm me-2">Sí</button>
                <button id="toastCancel" class="btn btn-secondary btn-sm">No</button>
            </div>
        `;

        toastEl.className = `toast align-items-center border border-secondary`;
        toastEl.style.backgroundColor = "#ffffff";
        toastEl.style.color = "#000000";
        toastEl.style.borderRadius = "0.5rem";
        toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: false });
        toast.show();

        // Limpiar listeners previos
        const btnConfirm = document.getElementById('toastConfirm');
        const btnCancel = document.getElementById('toastCancel');
        btnConfirm.replaceWith(btnConfirm.cloneNode(true));
        btnCancel.replaceWith(btnCancel.cloneNode(true));

        const newBtnConfirm = document.getElementById('toastConfirm');
        const newBtnCancel = document.getElementById('toastCancel');

        newBtnConfirm.addEventListener('click', () => {
            toast.hide();
            callback(true);
        });

        newBtnCancel.addEventListener('click', () => {
            toast.hide();
            callback(false);
        });
    }

});
