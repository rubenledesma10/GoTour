document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // 🔹 Mostrar siempre el contenido principal (todos pueden ver los sitios)
    body.style.display = 'block';

    // 🔹 Si no hay token → usuario no logueado
    if (!token) {
        console.log("Usuario no autenticado → solo puede visualizar los sitios.");
        // Ocultar botones de comentar y admin
        document.querySelectorAll('.btn-send-comment, .admin-only').forEach(el => el.style.display = 'none');
        return;
    }

    // 🔹 Usuario logueado
    console.log("Usuario autenticado con rol:", role);

    // 🔹 Ocultar accesos admin si no es administrador
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // ✅ Mostrar botón de comentar solo si es turista
    if (role === 'tourist') {
        document.querySelectorAll('.btn-send-comment').forEach(el => el.style.display = 'inline-block');
    } else {
        // Admin, recepcionista u otros → sin botón de comentar
        document.querySelectorAll('.btn-send-comment').forEach(el => el.style.display = 'none');
    }
});


// ==========================
// 🔹 Reactivar sitio (solo admin)
// ==========================
async function reactivateSite(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("⚠️ Debes iniciar sesión como administrador para reactivar sitios.");
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


// ==========================
// 🔹 Manejador de botón Reactivar (admin)
// ==========================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-reactivate');
    if (!btn) return;

    const id = btn.dataset.id;
    console.log("🟢 Click en botón Reactivar ID:", id);
    reactivateSite(id);
});
