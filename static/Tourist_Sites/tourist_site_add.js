document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el botón de cancelar
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }

    // Lógica para el formulario de agregar sitio turístico (POST)
    const addTouristSiteForm = document.getElementById('addTouristSiteForm');

    if (addTouristSiteForm) {
        addTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

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
                id_user: "1",
                is_activate: true
            };

            const requiredFields = ['name', 'description', 'address', 'phone', 'category', 'url', 'opening_hours', 'closing_hours'];
            for (const field of requiredFields) {
                if (!data[field] || String(data[field]).trim() === '') {
                    alert(`El campo ${field.charAt(0).toUpperCase() + field.slice(1)} es requerido.`);
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
                    alert('Error al agregar el sitio turístico: ' + (result.error || result.message));
                }
            } catch (error) {
                console.error('Error de red o del servidor:', error);
                alert('Ocurrió un error al intentar agregar el sitio turístico.');
            }
        });
    }
});
