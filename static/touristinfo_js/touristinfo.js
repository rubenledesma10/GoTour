document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('protectedBody');
    const token = localStorage.getItem('token');

    if (!token) {
        alert("⚠️ Debes iniciar sesión o registrarte para acceder a los sitios turísticos.");
        window.location.replace('/');
        return;
    }

    body.style.display = 'block';

    const role = localStorage.getItem('role');
    console.log("Rol detectado:", role);

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});
