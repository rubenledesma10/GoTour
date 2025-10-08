document.addEventListener('DOMContentLoaded', () => {
    const siteSelect = document.getElementById('siteSelect');
    const editTouristSiteForm = document.getElementById('editTouristSiteForm');
    const isActivateInput = document.getElementById('is_activate');

    // Lógica para el botón de cancelar
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }


    if (siteSelect && editTouristSiteForm) {
        // Cargar datos del sitio seleccionado
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
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('No se pudo obtener la información del sitio.');

                const siteData = await response.json();

                document.getElementById('name').value = siteData.name;
                document.getElementById('description').value = siteData.description;
                document.getElementById('address').value = siteData.address;
                document.getElementById('phone').value = siteData.phone;
                document.getElementById('category').value = siteData.category;
                document.getElementById('url').value = siteData.url;
                document.getElementById('average').value = siteData.average;
                document.getElementById('opening_hours').value = siteData.opening_hours?.substring(0, 5) || '';
                document.getElementById('closing_hours').value = siteData.closing_hours?.substring(0, 5) || '';

                if (isActivateInput) isActivateInput.checked = siteData.is_activate === 1;

            } catch (error) {
                console.error('Error al cargar la información del sitio:', error);
                alert('Hubo un error al cargar los datos.');
                editTouristSiteForm.reset();
            }
        });

        // Guardar cambios (PUT)
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
