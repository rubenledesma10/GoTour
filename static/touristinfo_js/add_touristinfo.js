document.addEventListener('DOMContentLoaded', () => {
    console.log("formAddTourist.js cargado correctamente");

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        alert("⚠️ Debes iniciar sesión para agregar turistas");
        window.location.href = "/login";
        return;
    }

    // Solo admin puede agregar turistas
    if (role !== 'admin') {
        alert("❌ Acceso denegado. Solo los administradores pueden agregar turistas.");
        window.location.href = "/";
        return;
    }

    const formAdd = document.getElementById('formAddTourist');
    if (!formAdd) return;

    // Botón cancelar (si existe)
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/touristinfo/';
        });
    }

    formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formAdd);

        // Validar campos requeridos
        const requiredFields = ['name', 'description', 'address', 'phone', 'category'];
        for (const field of requiredFields) {
            const value = formData.get(field);
            if (!value || String(value).trim() === '') {
                alert(`El campo "${field}" es obligatorio.`);
                return;
            }
        }

        try {
            const response = await fetch('/api/create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}` // token enviado correctamente
                    // Content-Type NO se agrega, FormData lo maneja solo
                }
            });

            const result = await response.json();

            if (response.ok) {
                alert('✅ Turista agregado correctamente');
                window.location.href = '/touristinfo/';
            } else {
                alert('❌ Error al agregar turista: ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('❌ Error de red o servidor:', error);
            alert('❌ Ocurrió un error al intentar agregar el turista');
        }
    });
});
