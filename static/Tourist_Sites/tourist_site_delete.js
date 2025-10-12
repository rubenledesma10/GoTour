document.addEventListener('DOMContentLoaded', () => {
    console.log(" Módulo de eliminación de sitios cargado");

    const deleteTouristSiteForm = document.getElementById('deleteTouristSiteForm');
    const siteSelectDelete = document.getElementById('siteSelect');
    const cancelButton = document.getElementById('cancelButton');

    // Verificación de rol desde localStorage
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
        alert("No tienes permisos para eliminar sitios turísticos.");
        window.location.href = '/tourist_sites/view';
        return; // Bloquea completamente la vista
    }

    // Botón para cancelar y volver a la vista de sitios turísticos
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = '/tourist_sites/view';
        });
    }

    // Logica principal del formulario de eliminación
    if (deleteTouristSiteForm && siteSelectDelete) {
        deleteTouristSiteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const selectedSiteId = siteSelectDelete.value;
            if (!selectedSiteId) {
                alert("Error: No hay un sitio seleccionado para eliminar.");
                return;
            }

            if (!confirm(`¿Estás seguro de que quieres eliminar (borrado lógico) el sitio seleccionado?`)) {
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
                    alert('Sitio turístico eliminado (marcado como inactivo) correctamente.');
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