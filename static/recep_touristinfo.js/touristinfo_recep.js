document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toLowerCase();
    const protectedBody = document.getElementById('protectedBody');

    // Solo "receptionist" puede ver esta página
    if (!token || role !== 'receptionist') {
        protectedBody.innerHTML = '<div class="container mt-5"><h3>No tenés permisos para ver esta página.</h3></div>';
        protectedBody.style.display = 'block';
        return;
    }

    protectedBody.style.display = 'block';

    // Mostrar botones de receptionist
    const btnShowAdd = document.getElementById('btnShowAdd');
    if (btnShowAdd) btnShowAdd.classList.remove('d-none');

    document.querySelectorAll('.btnEdit, .btnDelete').forEach(btn => btn.classList.remove('d-none'));
});
