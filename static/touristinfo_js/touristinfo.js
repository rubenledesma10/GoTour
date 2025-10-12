document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const protectedBody = document.getElementById('protectedBody');

    // Verificación de acceso
    if (!token || (role !== 'admin' && role !== 'recepcionist')) {
        protectedBody.innerHTML = '<div class="container mt-5"><h3>No tenés permisos para ver esta página.</h3></div>';
        protectedBody.style.display = 'block';
        return;
    }

    protectedBody.style.display = 'block';

    // Mostrar/ocultar elementos del navbar según data-role
    document.querySelectorAll("#navbarRol [data-role]").forEach(el => {
        const rolesPermitidos = el.dataset.role.split(',').map(r => r.trim());
        if (rolesPermitidos.includes(role)) {
            el.classList.remove("d-none");

            // Si es recepcionist, ajustar href si es distinto
            if (role === "recepcionist" && el.id === "linkTouristInfo") {
                el.href = "/touristinfo_recep"; // ruta específica para recepcionist
            }
        }
    });

    // Definir baseApiUrl según rol (para tu touristinfo.js)
    let baseApiUrl = role === "recepcionist" ? "/api/touristinfo_recep" : "/api/touristinfo";
    localStorage.setItem("baseApiUrl", baseApiUrl);

    // Botón agregar solo para admin
    const btnShowAdd = document.getElementById('btnShowAdd');
    const addFormContainer = document.getElementById('addFormContainer');
    const btnCancelAdd = document.getElementById('btnCancelAdd');
    if (role !== "admin" && btnShowAdd) btnShowAdd.classList.add('d-none');

    if (btnShowAdd && addFormContainer && btnCancelAdd) {
        btnShowAdd.addEventListener('click', () => {
            addFormContainer.classList.remove('d-none');
            window.scrollTo({ top: addFormContainer.offsetTop, behavior: 'smooth' });
        });
        btnCancelAdd.addEventListener('click', () => {
            addFormContainer.classList.add('d-none');
        });
    }
});


    