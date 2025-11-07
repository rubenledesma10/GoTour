document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo de eliminación de sitios cargado");

    const deleteTouristSiteForm = document.getElementById('deleteTouristSiteForm');
    const siteSelectDelete = document.getElementById('siteSelect');
    const cancelButton = document.getElementById('cancelButton');

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Si no hay token, redirigir
    if (!token) {
        showToast("No hay token de acceso. Inicia sesión.", "warning");
        setTimeout(() => window.location.href = '/api/gotour/login', 2000);
        return;
    }

    // Verificación de rol desde localStorage
    if (role !== 'admin') {
        showToast("No tienes permisos para acceder aquí", "danger");
        setTimeout(() => window.location.href = '/tourist_sites/view', 2000);
        return;
    }

    // Botón cancelar
    cancelButton?.addEventListener('click', () => {
        window.location.href = '/tourist_sites/view';
    });

    // Función para mostrar un toast
    function showToast(message, type = "info") {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = `toast${Date.now()}`;

    // Determinar color de texto según tipo
    let textColor = "text-dark"; // por defecto negro
    if (type === "danger") textColor = "text-danger";
    if (type === "success") textColor = "text-dark";
    if (type === "warning") textColor = "text-warning";

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center bg-white border shadow-sm mb-2 ${textColor}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

    // Modal de confirmación
    function confirmDelete(message, callbackYes) {
        // Eliminar modal previo si existe
        const oldModal = document.getElementById("confirmModal");
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div class="modal fade" id="confirmModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Confirmar eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">${message}</div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button id="btnConfirmYes" type="button" class="btn btn-danger">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        const modalElement = document.getElementById('confirmModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalElement.querySelector("#btnConfirmYes").addEventListener("click", async () => {
            // Ejecutar la acción primero (antes de eliminar el modal)
            await callbackYes();

            modal.hide();
        });

        // Eliminar modal del DOM después de cerrarlo
        modalElement.addEventListener("hidden.bs.modal", () => {
            modalElement.remove();
        }, { once: true });
    }

    // Lógica de eliminación
    deleteTouristSiteForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        const selectedSiteId = siteSelectDelete.value;
        if (!selectedSiteId) {
            showToast("Selecciona un sitio primero", "warning");
            return;
        }

        confirmDelete(
            `¿Deseas eliminar este sitio turístico? El borrado es lógico.`,
            async () => {
                try {
                    const response = await fetch(`/api/tourist_sites/${selectedSiteId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const result = await response.json();

                    if (response.ok) {
                        showToast("Sitio turístico eliminado exitosamente", "success");
                        setTimeout(() => {
                            window.location.href = "/tourist_sites/view";
                        }, 1500);
                    } else {
                        showToast(result.error || result.message || "Error al eliminar", "danger");
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    showToast("Hubo un error en la solicitud.", "danger");
                }
            }
        );
    });
});
