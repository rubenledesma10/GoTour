document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const body = document.getElementById("protectedBody");

    if (!token) {
        alert("⚠️ Debes iniciar sesión para editar CITs.");
        window.location.replace("/login");
        return;
    }

    if (body) body.style.display = "block";

    if (role !== "admin") {
        alert("❌ No tienes permisos para editar CITs.");
        window.location.replace("/cit/view");
        return;
    }

    const editForm = document.getElementById("editCitForm");
    if (!editForm) {
        console.error("⚠️ No se encontró el formulario de edición.");
        return;
    }

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const citId = editForm.dataset.id;
        if (!citId) {
            alert("⚠️ No se encontró el ID del CIT.");
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
                alert("✅ CIT actualizado correctamente.");
                window.location.replace("/cit/view");
            } else {
                alert("❌ Error al actualizar: " + (result.error || result.message));
            }
        } catch (error) {
            console.error("⚠️ Error al editar:", error);
            alert("⚠️ No se pudo conectar con el servidor.");
        }
    });
});
