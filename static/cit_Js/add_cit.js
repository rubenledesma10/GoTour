document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');

    if (!token) {
        alert("⚠️ Debes ser Administrador para editar los CITs.");
        window.location.replace('/');
        return;
    }

    body.style.display = 'block';

    const role = localStorage.getItem('role');
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        return;
    }

    // --- Manejo de crear CIT ---
    const createForm = document.getElementById('create-cit-form');
    if (!createForm) return;

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(createForm);

        try {
            const response = await fetch(createForm.action, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                alert("❌ Error al crear CIT: " + (result.error || "Error desconocido"));
                return;
            }

            alert("CIT creado correctamente ✅");
            window.location.reload();

        } catch (error) {
            console.error("Error al crear CIT:", error);
            alert("❌ Error al conectar con el servidor");
        }
    });
});
