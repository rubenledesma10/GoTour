document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const body = document.getElementById("protectedBody");
    body.style.display = "block";

    if (role !== "admin") {
        alert("❌ No tienes permisos para editar CITs.");
        window.location.replace("/cit");
        return;
    }

    const editForm = document.getElementById("editCitForm");
    if (!editForm) return;

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/cit/${editForm.dataset.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert("✅ CIT actualizado correctamente.");
                window.location.replace("/cit");
            } else {
                alert("❌ Error: " + (result.error || result.message));
            }
        } catch (error) {
            alert("⚠️ Error al editar: " + error.message);
        }
    });
});
