document.addEventListener('DOMContentLoaded', () => {
    console.log("tourist_site_add.js cargado correctamente");

    
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/login";
        return;
    }

    // Control de acceso: solo admins

    if (role !== 'admin') {
        alert("Acceso denegado. Solo los administradores pueden agregar sitios turísticos.");
        window.location.href = "/";
        return;
    }

    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }

    const addTouristSiteForm = document.getElementById('addTouristSiteForm');
    if (!addTouristSiteForm) return;

    addTouristSiteForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Creamos FormData (permite texto + archivo)
        const formData = new FormData(addTouristSiteForm);

        // Validación de campos requeridos
        const requiredFields = ['name', 'description', 'address', 'phone','category', 'url', 'opening_hours', 'closing_hours', 'photo'];

        for (const field of requiredFields) {
            const value = formData.get(field);
            if (!value || String(value).trim() === '') {
                alert(`El campo "${field}" es requerido.`);
                return;
            }
        }

        // Agregamos valores por defecto
        formData.append('is_activate', 'true');
        if (!formData.get('average') || formData.get('average') === '') {
            formData.set('average', '0');
        }
        
        console.log("Token enviado:", token);

        try {
            const response = await fetch('/api/add_tourist_sites', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No ponemos el 'Content-Type' ya que el FormData lo maneja automáticamente
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert('✅ Sitio turístico agregado con éxito!');
                window.location.href = '/tourist_sites/view';
            } else {
                alert('⚠️ Error al agregar el sitio turístico: ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('❌ Error de red o del servidor:', error);
            alert('❌ Ocurrió un error al intentar agregar el sitio turístico.');
        }
    });

    // Vista previa de la imagen seleccionada
    const photoInput = document.getElementById('photo');
    const previewImage = document.getElementById('previewImage');

    if (photoInput && previewImage) {
        photoInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.style.display = 'none';
            }
        });
    }
});