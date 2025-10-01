document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editUserForm");
    const userId = form.dataset.userId;
    const token = localStorage.getItem("token");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const res = await fetch(`/api/admin/edit/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // No ponemos Content-Type, fetch lo maneja con FormData
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error editando usuario");

            alert("Usuario editado correctamente ✅");
            window.location.href = "/api/admin/users_page"; // redirige a la lista
        } catch (err) {
            console.error("Error en edición:", err);
            alert("Error: " + err.message);
        }
    });
});
