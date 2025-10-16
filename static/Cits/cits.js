document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');


    // VALIDACIÓN DE ACCESO
    // if (!token) {
    //     alert("⚠️ Debes iniciar sesión o registrarte para acceder a los Centros de Información Turística.");
    //     window.location.replace('/'); 
    //     return;
    // }

    if (body) body.style.display = 'block';

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    console.log("✅ Página de CITs cargada correctamente. Rol:", role);

    // ==========================================================

    // ACCESO A LOS BOTONES DE ACTIVAR / DESACTIVAR
    const buttons = document.querySelectorAll('.btnToggle');
    console.log("🧩 Botones encontrados:", buttons.length);

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const citId = button.dataset.id;
            const action = button.dataset.action;

            if (!citId) {
                alert("⚠️ No se encontró el ID del CIT.");
                return;
            }

            const confirmMsg = action === 'deactivate'
                ? '¿Deseas desactivar este CIT?'
                : '¿Deseas reactivar este CIT?';

            if (!confirm(confirmMsg)) return;

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
                    alert(successMsg);
                    window.location.reload();
                } else {
                    alert("❌ Error: " + (result.error || result.message));
                }
            } catch (error) {
                console.error("⚠️ Error al conectar con el servidor:", error);
                alert("⚠️ Error al conectar con el servidor.");
            }
        });
    });

    // ==========================================================

    // ---------------- ACCESO AL BOTON DE EDITAR ----------------
    const editButtons = document.querySelectorAll(".btnEdit");

    if (editButtons.length === 0) {
        console.warn("⚠️ No se encontraron botones de edición (.btnEdit).");
    } else {
        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const citId = button.dataset.id;
                if (!citId) {
                    alert("⚠️ No se encontró el ID del CIT para editar.");
                    return;
                }

                console.log(`✏️ Redirigiendo a /cit/edit/${citId}`);
                window.location.href = `/cit/edit/${citId}`;
            });
        });
    }
});
