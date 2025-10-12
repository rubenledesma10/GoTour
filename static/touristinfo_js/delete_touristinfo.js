document.querySelectorAll('.btnDelete').forEach(btn => {
    btn.addEventListener('click', async e => {
        if (!confirm('¿Seguro que querés eliminar?')) return;
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const token = localStorage.getItem('token');

        // 🔹 Tomamos la URL base del rol (guardada en localStorage)
        const baseApiUrl = localStorage.getItem('baseApiUrl') || '/api/touristinfo';

        try {
            const res = await fetch(`${baseApiUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (res.ok) location.reload();
            else {
                const err = await res.json();
                alert(err.error || 'Error al eliminar');
            }
        } catch (err) {
            alert('Error al eliminar');
        }
    });
});
