document.addEventListener('DOMContentLoaded', () => {
    console.log("add_cit.js cargado correctamente");

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/login";
        return;
    }

    if (role !== 'admin') {
        alert("Acceso denegado. Solo los administradores pueden agregar CITs.");
        window.location.href = "/";
        return;
    }

    const createForm = document.getElementById('create-cit-form');
    if (!createForm) return;

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(createForm);
        console.log("Token enviado:", token);

        try {
            const response = await fetch('/api/add_cit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert('✅ CIT agregado con éxito!');
                window.location.href = '/cit/view';
            } else {
                alert('⚠️ Error al agregar el CIT: ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('❌ Error de red o del servidor:', error);
            alert('❌ Ocurrió un error al intentar agregar el CIT.');
        }
    });
});
