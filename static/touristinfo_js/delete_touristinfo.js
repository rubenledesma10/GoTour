document.querySelectorAll('.btnDelete').forEach(btn => {
    btn.addEventListener('click', async e => {
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const token = localStorage.getItem('token');
        const baseApiUrl = localStorage.getItem('baseApiUrl') || '/api/touristinfo';

        if (!await showToastConfirm('¿Seguro que querés eliminar?')) return;

        try {
            const res = await fetch(`${baseApiUrl}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (res.ok) location.reload();
            else {
                const err = await res.json();
                showToast(err.error || 'Error al eliminar');
            }
        } catch (err) {
            showToast('Error al eliminar');
        }
    });
});
