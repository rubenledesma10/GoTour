document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const btnDelete = document.getElementById("btnConfirmDelete");

    // Verificación de sesión y permisos
    if (!token) {
        alert("⚠️ Debes iniciar sesión para continuar.");
        window.location.replace("/login");
        return;
    }

    if (role !== "admin") {
        alert("❌ No tienes permisos para eliminar CITs.");
        window.location.replace("/cit/view");
        return;
    }

    if (!btnDelete) {
        console.error("No se encontró el botón con id='btnConfirmDelete'");
        return;
    }

    // eliminado lógico
    btnDelete.addEventListener("click", async () => {
        const citId = btnDelete.dataset.id;
        if (!citId) {
            alert("⚠️ No se encontró el ID del CIT.");
            return;
        }

        if (!confirm("¿Estás seguro de eliminar (inactivar) este CIT?")) return;

        try {
            const response = await fetch(`/api/cit/${citId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ CIT marcado como inactivo correctamente.");
                window.location.replace("/cit/view");
            } else {
                alert("❌ Error: " + (result.error || result.message));
            }
        } catch (error) {
            console.error("⚠️ Error al eliminar:", error);
            alert("⚠️ No se pudo conectar con el servidor.");
        }
    });
});