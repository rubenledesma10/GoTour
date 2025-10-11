document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("⚠️ Debes iniciar sesión para realizar esta acción");
        window.location.replace("/");
        return;
    }

    document.querySelectorAll(".formDeleteTourist").forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const touristId = form.dataset.id;
            if (!touristId) return;

            if (!confirm("¿Estás seguro de eliminar este turista?")) return;

            try {
                const response = await fetch(`/api/${touristId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.status === 401) {
                    alert("❌ No autorizado. Verifica tu token.");
                    return;
                }

                const result = await response.json();

                if (!response.ok) {
                    alert("❌ Error: " + (result.error || "No se pudo eliminar el turista"));
                    return;
                }

                alert(result.message || "✅ Turista eliminado correctamente");

                // Eliminamos la fila de la tabla sin recargar
                const row = form.closest("tr");
                if (row) row.remove();

            } catch (error) {
                console.error("Error al eliminar turista:", error);
                alert("❌ Error de conexión con el servidor");
            }
        });
    });
});
