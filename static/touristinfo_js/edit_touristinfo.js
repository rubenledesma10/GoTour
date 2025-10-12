document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEditTourist");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("id")?.value;
        if (!id) {
            alert("❌ ID no encontrado");
            return;
        }

        const formData = new FormData(form);
        const token = localStorage.getItem("token");

        if (!token) {
            alert("⚠️ Debes iniciar sesión para editar información turística");
            window.location.replace("/");
            return;
        }

        try {
            const response = await fetch(`/api/touristinfo/${id}`, {
                method: "PATCH",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("✅ Información actualizada correctamente");
                window.location.href = "/api/touristinfo/planilla";
            } else {
                const error = await response.json();
                alert("❌ Error: " + (error.error || "No se pudo actualizar"));
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("❌ Error de conexión con el servidor");
        }
    });
});
