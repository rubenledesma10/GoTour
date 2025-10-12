document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');

    // Si no hay token → redirige al inicio
    if (!token) {
        alert("⚠️ Debes iniciar sesión o registrarte para acceder a los sitios turísticos.");
        window.location.replace('/'); 
        return;
    }

    
    // Mostrar contenido protegido
    body.style.display = 'block';

    // Verificamos rol
    const role = localStorage.getItem('role');
    console.log("Rol detectado:", role);

    // Ocultar accesos admin si no es administrador
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});


// Función para reactivar un sitio turístico
async function reactivateSite(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("No hay token de acceso válido. Por favor, inicia sesión.");
        return;
    }

    if (!confirm("¿Deseas reactivar este sitio turístico?")) return;

    try {
        const response = await fetch(`/api/tourist_sites/${id}/reactivate`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        console.log("Respuesta del servidor:", result);

        if (response.ok) {
            alert("✅ Sitio turístico reactivado con éxito");
            window.location.reload();
        } else {
            alert("⚠️ " + (result.error || result.message));
        }
    } catch (error) {
        console.error("Error al reactivar el sitio:", error);
        alert("❌ Error inesperado al intentar reactivar el sitio.");
    }
}

// Manejador de eventos para el botón de reactivar
document.addEventListener('click', (e) => {
    // Detecta clics en el botón o dentro del ícono del botón
    const btn = e.target.closest('.btn-reactivate');
    if (!btn) return; // si no es el botón, salir

    const id = btn.dataset.id;
    console.log("🟢 Click en botón Reactivar ID:", id);
    reactivateSite(id);
});





// Enviar comentario
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-send-comment');
    if (!btn) return;

    const siteId = btn.dataset.id;
    const textarea = document.querySelector(`.comment-input[data-id="${siteId}"]`);
    const content = textarea.value.trim();

    if (!content) {
        alert("⚠️ El comentario no puede estar vacío.");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Debes iniciar sesión como turista para comentar.");
        return;
    }

    try {
        const response = await fetch(`/api/tourist_sites/${siteId}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        const result = await response.json();
        console.log("Resultado comentario:", result);

        if (response.ok) {
            alert("✅ Comentario agregado con éxito");
            textarea.value = "";
        } else {
            alert("⚠️ " + (result.error || result.message));
        }

    } catch (error) {
        console.error("Error al enviar comentario:", error);
        alert("❌ Error inesperado al agregar comentario.");
    }
});