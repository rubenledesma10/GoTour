document.addEventListener('DOMContentLoaded', () => {
    const deleteTouristSiteForm = document.getElementById('deleteTouristSiteForm');
    const siteSelectDelete = document.getElementById('siteSelect');

        // Lógica para el botón de cancelar
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }


    if (deleteTouristSiteForm && siteSelectDelete) {
        deleteTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const selectedSiteId = siteSelectDelete.value;
            if (!selectedSiteId) {
                alert("Error: No hay un sitio seleccionado para eliminar.");
                return;
            }

            if (!confirm(`¿Estás seguro de que quieres eliminar (borrado lógico) el sitio con ID ${selectedSiteId}?`)) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No hay token de acceso válido. Por favor, inicia sesión.");
                return;
            }

            try {
                const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Sitio turístico marcado como inactivo con éxito!');
                    window.location.href = '/tourist_sites/view';
                } else {
                    alert('Error al eliminar: ' + (result.error || result.message));
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Ocurrió un error al intentar eliminar el sitio turístico.');
            }
        });
    }
});
