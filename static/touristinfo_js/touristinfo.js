
    document.addEventListener('DOMContentLoaded', () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const protectedBody = document.getElementById('protectedBody');

        if (!token || role !== 'admin') {
            protectedBody.innerHTML = '<div class="container mt-5"><h3>No tenés permisos para ver esta página.</h3></div>';
            protectedBody.style.display = 'block';
            return;
        }

        protectedBody.style.display = 'block';
    });
        
    document.addEventListener('DOMContentLoaded', () => {
        const btnShowAdd = document.getElementById('btnShowAdd');
        const addFormContainer = document.getElementById('addFormContainer');
        const btnCancelAdd = document.getElementById('btnCancelAdd');

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

    