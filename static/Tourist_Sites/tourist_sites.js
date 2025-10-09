document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');

    // Si no hay token, nos alerta de que debemos iniciar sesion o registrarnos, luego nos redirige al inicio.
    if (!token) {
        alert("⚠️ Debes iniciar sesión o registrarte para acceder a los sitios turísticos.");
        window.location.replace('/'); 
        return;
    }

    // Si hay token, mostramos el contenido.
    body.style.display = 'block';

    // Verificamos el rol para ocultar accesos de administrador
    const role = localStorage.getItem('role');
    console.log("Rol detectado:", role);

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});
