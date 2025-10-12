document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const body = document.getElementById("protectedBody");
    body.style.display = "block";

    if (role !== "admin") {
        alert("❌ No tienes permisos para eliminar CITs.");
        window.location.replace("/cit");
        return;
    }

    const btnDelete = document.getElementById("btnConfirmDelete");
    if (!btnDelete) return;

    btnDelete.addEventListener("click", async () => {
        const citId = btnDelete.dataset.id; // asegurate de agregar data-id="{{ cit.id_cit }}"
        if (!citId) return;

        if (!confirm("¿Estás seguro de eliminar este CIT?")) return;

        try {
            const response = await fetch(`/api/cit/${citId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();
            if (response.ok) {
                alert("🗑️ CIT eliminado correctamente.");
                window.location.replace("/cit");
            } else {
                alert("❌ Error: " + (data.error || data.message));
            }
        } catch (error) {
            alert("⚠️ Error al eliminar: " + error.message);
        }
    });
});
