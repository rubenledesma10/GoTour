const tbodyDelete = document.querySelector('tbody');

if (tbodyDelete) {
    tbodyDelete.addEventListener('click', async e => {
        const row = e.target.closest('tr');
        if (!row || !row.dataset.id) return;
        const id = row.dataset.id;

        if (e.target.classList.contains('btnDelete')) {
            if (!confirm('¿Seguro que querés eliminar?')) return;

            try {
                const res = await fetch(`${baseApiUrl}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const result = await res.json();
                if (res.ok) location.reload();
                else alert(result.error || 'Error al eliminar');
            } catch (err) {
                alert('Error de conexión al eliminar');
                console.error(err);
            }
        }
    });
}
