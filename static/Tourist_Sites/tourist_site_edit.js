document.addEventListener('DOMContentLoaded', () => {
    console.log("tourist_site_edit.js cargado correctamente");

    // Control de acceso - solo admins
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // Si no hay token o el usuario no es admin, redirigimos a login o vista principal
    if (!token) {
        alert("No hay token de acceso. Por favor, inicia sesión.");
        window.location.href = '/login'; // o la ruta de tu login
        return;
    }

    if (role !== 'admin') {
        alert("No tienes permisos para acceder a esta sección.");
        window.location.href = '/tourist_sites/view';
        return;
    }

    // Logica principal
    const siteSelect = document.getElementById('siteSelect');
    const editTouristSiteForm = document.getElementById('editTouristSiteForm');
    const cancelButton = document.getElementById('cancelButton');

    // Elementos del archivo imagen
    const currentImage = document.getElementById('currentImage');
    const noImageText = document.getElementById('noImageText');
    const previewImage = document.getElementById('previewImage');
    const photoInput = document.getElementById('photo');
    const noNewImageText = document.getElementById('noNewImageText');
    
    // Vista previa de la nueva imagen
    if (photoInput) {
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                    if (noNewImageText) noNewImageText.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.src = '';
                previewImage.style.display = 'none';
                if (noNewImageText) noNewImageText.style.display = 'block';
            }
        });
    }

    // Botón para cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }


    // Carga los datos del sitio seleccionado
    if (siteSelect && editTouristSiteForm) {
        siteSelect.addEventListener('change', async (event) => {
            const selectedSiteId = event.target.value;
            if (!selectedSiteId) {
                editTouristSiteForm.reset();
                currentImage.style.display = 'none';
                noImageText.style.display = 'block';
                return;
            }

            try {
                const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('No se pudo obtener la información del sitio.');

                const siteData = await response.json();

                // Rellenamos los campos
                document.getElementById('name').value = siteData.name || '';
                document.getElementById('description').value = siteData.description || '';
                document.getElementById('address').value = siteData.address || '';
                document.getElementById('phone').value = siteData.phone || '';
                document.getElementById('category').value = siteData.category || '';
                document.getElementById('url').value = siteData.url || '';
                document.getElementById('average').value = siteData.average || '';
                document.getElementById('opening_hours').value = siteData.opening_hours?.substring(0, 5) || '';
                document.getElementById('closing_hours').value = siteData.closing_hours?.substring(0, 5) || '';

                // Imagen actual
                if (siteData.photo) {
                    currentImage.src = siteData.photo;
                    currentImage.style.display = 'block';
                    noImageText.style.display = 'none';
                } else {
                    currentImage.style.display = 'none';
                    noImageText.style.display = 'block';
                }

                // Limpia la vista previa anterior
                previewImage.src = '';
                previewImage.style.display = 'none';
                photoInput.value = '';

            } catch (error) {
                console.error('Error al cargar el sitio:', error);
                alert('Hubo un error al cargar los datos.');
                editTouristSiteForm.reset();
            }
        });

        // Guardamos los cambios
        editTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const selectedSiteId = siteSelect.value;
            if (!selectedSiteId) {
                alert("Error: No hay un sitio seleccionado para actualizar.");
                return;
            }

            const formData = new FormData(editTouristSiteForm);

            try {
                const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Sitio turístico actualizado con éxito!');
                    window.location.href = '/tourist_sites/view';
                } else {
                    alert('Error al actualizar: ' + (result.error || result.message));
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Ocurrió un error al intentar actualizar el sitio turístico.');
            }
        });
    }
});