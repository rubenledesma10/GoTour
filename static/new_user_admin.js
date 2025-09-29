document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("No token encontrado, redirigiendo...");
        window.location.href = "/";
        return;
    }

    const registerAdminForm = document.getElementById("registerAdminForm");
    if (!registerAdminForm) return;

    registerAdminForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // ⚠️ previene GET

        const formData = new FormData(registerAdminForm);

        try {
            const res = await fetch("/api/admin/add", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const result = await res.json();

            if (res.ok) {
                alert("Usuario registrado correctamente!");
                registerAdminForm.reset();
                window.location.href = "/api/admin/users_page";
            } else {
                alert(result.error || result.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error al registrar usuario");
        }
    });
});
