document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addTouristSiteForm');
    const cancelButton = document.getElementById('cancelButton');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            // Recopilamos los datos directamente de los elementos del formulario por su atributo "name"
            const data = {
                name: form.name.value,
                description: form.description.value,
                address: form.address.value,
                phone: form.phone.value,
                category: form.category.value,
                url: form.url.value,
                // 'average' puede ser opcional o nulo, maneja la conversión si tiene valor
                average: form.average.value !== '' ? parseFloat(form.average.value) : null,
                // Nuevos campos para horario
                opening_time: form.opening_time ? form.opening_time.value : null, // 
                closing_time: form.closing_time ? form.closing_time.value : null  // 
            };

            // Validar campos requeridos antes de enviar
            const requiredFields = ['name', 'description', 'address', 'phone', 'category', 'url'];
            for (const field of requiredFields) {
                if (!data[field] || data[field].trim() === '') {
                    alert(`${field.charAt(0).toUpperCase() + field.slice(1)} es requerido y no puede estar vacío.`);
                    return; // Detener el envío si falta un campo requerido
                }
            }

            try {
                const response = await fetch('/api/tourist_sites/', { // Asegúrate de que esta URL sea la correcta
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Sitio turístico agregado con éxito!');
                    window.location.href = '/tourist_sites/view'; // Redirige a la lista de sitios
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

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/'; // Redirige al inicio
        });
    }
});