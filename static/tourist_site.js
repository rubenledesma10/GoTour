    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('addTouristSiteForm');
        const cancelButton = document.getElementById('cancelButton');

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault(); 

                const token = localStorage.getItem('access_token');
                if (!token) {
                    alert("No hay token de acceso válido. Por favor, inicia sesión.");
                    return;
                }

                const data = {
                    name: form.name.value,
                    description: form.description.value,
                    address: form.address.value,
                    phone: form.phone.value,
                    category: form.category.value,
                    url: form.url.value,
                    average: form.average.value !== '' ? parseFloat(form.average.value) : null, //Utilizo parseFloat para convertir string a numero float
                    opening_hours: form.opening_hours.value,
                    closing_hours: form.closing_hours.value,
                    id_user: "1",  
                    is_activate: true
                };

                const requiredFields = ['name', 'description', 'address', 'phone', 'category', 'url', 'opening_hours', 'closing_hours'];
                for (const field of requiredFields) {
                    if (!data[field] || data[field].trim() === '') {
                        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} es requerido y no puede estar vacío.`);
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

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
    });
