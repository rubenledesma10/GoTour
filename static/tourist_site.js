document.addEventListener('DOMContentLoaded', () => {

    // Logica para el formulario de agregar sitio turístico (POST)
    
    const addTouristSiteForm = document.getElementById('addTouristSiteForm');

    if (addTouristSiteForm) {
        addTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No hay token de acceso válido. Por favor, inicia sesión.");
                return;
            }

            // Recopilamos los datos del formulario
            const data = {
                name: document.getElementById('name').value,
                description: document.getElementById('description').value,
                address: document.getElementById('address').value,
                phone: document.getElementById('phone').value,
                category: document.getElementById('category').value,
                url: document.getElementById('url').value,
                average: document.getElementById('average').value !== '' ? parseFloat(document.getElementById('average').value) : null,
                opening_hours: document.getElementById('opening_hours').value,
                closing_hours: document.getElementById('closing_hours').value,
                id_user: "1",
                is_activate: true // Por defecto, el nuevo sitio se agrega como activo
            };

            const requiredFields = ['name', 'description', 'address', 'phone', 'category', 'url', 'opening_hours', 'closing_hours'];
            for (const field of requiredFields) {
                if (!data[field] || String(data[field]).trim() === '') {
                    alert(`El campo ${field.charAt(0).toUpperCase() + field.slice(1)} es requerido y no puede estar vacío.`);
                    return;
                }
            }

            try {
                const response = await fetch('/api/add_tourist_sites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Sitio turístico agregado con éxito!');
                    window.location.href = '/tourist_sites/view';
                } else {
                    alert('Error al agregar el sitio turístico: ' + (result.error || result.message || JSON.stringify(result)));
                    console.error('API Error:', result);
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                alert('Ocurrió un error al intentar agregar el sitio turístico.');
            }
        });
    }

    // Lógica para el botón de cancelar
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    
    // Logica para el formulario de editar sitio turístico (PUT)
    
    const siteSelect = document.getElementById('siteSelect');
    const editTouristSiteForm = document.getElementById('editTouristSiteForm');

    const isActivateInput = document.getElementById('is_activate'); 

    if (siteSelect && editTouristSiteForm) {
        // Lógica para CARGAR los datos (al utilizar el select de sitios)
        siteSelect.addEventListener('change', async (event) => {
            const selectedSiteId = event.target.value;

            if (!selectedSiteId) {
                editTouristSiteForm.reset();
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No hay token de acceso válido. Por favor, inicia sesión.");
                return;
            }

            try {
                const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('No se pudo obtener la información del sitio.');
                }

                const siteData = await response.json();

                // Obtenemos todos los campos del formulario con sus datos para realizar la EDICIÓN
                document.getElementById('name').value = siteData.name;
                document.getElementById('description').value = siteData.description;
                document.getElementById('address').value = siteData.address;
                document.getElementById('phone').value = siteData.phone;
                document.getElementById('category').value = siteData.category;
                document.getElementById('url').value = siteData.url;
                document.getElementById('average').value = siteData.average;
                document.getElementById('opening_hours').value = siteData.opening_hours ? siteData.opening_hours.substring(0, 5) : '';
                document.getElementById('closing_hours').value = siteData.closing_hours ? siteData.closing_hours.substring(0, 5) : '';

                // Manejamos el estado de activación
                if (isActivateInput) {
                    isActivateInput.checked = siteData.is_activate === 1;
                }

            } catch (error) {
                console.error('Error al cargar la información del sitio:', error);
                alert('Hubo un error al cargar los datos. Por favor, inténtelo de nuevo.');
                editTouristSiteForm.reset();
            }
        });

        // Lógica para actualizar al enviar el formulario (PUT)
        editTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const selectedSiteId = siteSelect.value;
            if (!selectedSiteId) {
                alert("Error: No hay un sitio seleccionado para actualizar.");
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No hay token de acceso válido. Por favor, inicia sesión.");
                return;
            }

            // Recopilamos los datos del formulario
            const data = {
                name: document.getElementById('name').value,
                description: document.getElementById('description').value,
                address: document.getElementById('address').value,
                phone: document.getElementById('phone').value,
                category: document.getElementById('category').value,
                url: document.getElementById('url').value,
                average: document.getElementById('average').value !== '' ? parseFloat(document.getElementById('average').value) : null,
                opening_hours: document.getElementById('opening_hours').value,
                closing_hours: document.getElementById('closing_hours').value,
                // Enviar el estado de activación (1 activo, 0 inactivo )
                is_activate: isActivateInput ? (isActivateInput.checked ? 1 : 0) : undefined,
            };

            try {
                const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Sitio turístico actualizado con éxito!');
                    window.location.reload();
                } else {
                    alert('Error al actualizar: ' + (result.error || result.message || JSON.stringify(result)));
                    console.error('API Error:', result);
                }
            } catch (error) {
                console.error('Error de red o del servidor al actualizar:', error);
                alert('Ocurrió un error al intentar actualizar el sitio turístico.');
            }
        });
    }


    
    // Logica para el formulario de eliminar sitio turístico (DELETE)

    const deleteTouristSiteForm = document.getElementById('deleteTouristSiteForm');
    const siteSelectDelete = document.getElementById('siteSelect');

    if (deleteTouristSiteForm && siteSelectDelete) {

        deleteTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const selectedSiteId = siteSelectDelete.value;

            if (!selectedSiteId) {
                alert("Error: No hay un sitio seleccionado para eliminar.");
                return;
            }

            // Confirmación de eliminación
            if (!confirm(`¿Estás seguro de que quieres realizar el borrado lógico del sitio con ID ${selectedSiteId}? Esto lo marcará como inactivo.`)) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No hay token de acceso válido. Por favor, inicia sesión.");
                return;
            }

            try {
                // Llamada a la API con método DELETE
                const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    alert(' Sitio turístico marcado como inactivo con éxito: ' + result.message);
                    window.location.reload();
                } else {
                    alert(' Error al eliminar: ' + (result.error || result.message || JSON.stringify(result)));
                    console.error('API Error:', result);
                }
            } catch (error) {
                console.error('Error de red o del servidor al eliminar:', error);
                alert('Ocurrió un error al intentar eliminar el sitio turístico.');
            }
        });
    }
});