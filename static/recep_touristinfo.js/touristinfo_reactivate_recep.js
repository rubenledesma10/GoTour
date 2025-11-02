document.querySelector('tbody')?.addEventListener('click', async e => {
    const row = e.target.closest('tr');
    if (!row) return;
    const id = row.dataset.id;
    const token = localStorage.getItem('token');
    const baseUrl = '/api/touristinfo_recep';

    // Eliminar
    if (e.target.classList.contains('btnDelete')) {
        if (!await showToastConfirm('¿Seguro que querés eliminar este turista?')) return;

        try {
            const res = await fetch(`${baseUrl}/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await res.json();
            if (res.ok) {
                showToast(result.message || 'Turista eliminado correctamente.');
                row.classList.add('table-danger');
                row.querySelector('.btnEdit')?.classList.add('d-none');
                row.querySelector('.btnDelete')?.classList.add('d-none');

                const btnReact = document.createElement('button');
                btnReact.className = 'btn btn-sm btn-success btnReactivate';
                btnReact.textContent = 'Reactivar';
                row.querySelector('td:last-child').appendChild(btnReact);
            } else showToast(result.error || 'Error al eliminar.');
        } catch (err) {
            console.error(err);
            showToast('Error de conexión al eliminar.');
        }
    }

    // Reactivar
    if (e.target.classList.contains('btnReactivate')) {
        if (!await showToastConfirm('¿Seguro que querés reactivar este turista?')) return;

        try {
            const res = await fetch(`${baseUrl}/${id}/reactivate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await res.json();
            if (res.ok) {
                showToast(result.message || 'Turista reactivado correctamente.');
                row.classList.remove('table-danger');
                e.target.remove();

                const td = row.querySelector('td:last-child');
                const btnEdit = document.createElement('button');
                btnEdit.className = 'btn btn-sm btn-warning btnEdit';
                btnEdit.textContent = 'Editar';

                const btnDel = document.createElement('button');
                btnDel.className = 'btn btn-sm btn-danger btnDelete ms-2';
                btnDel.textContent = 'Eliminar';

                td.appendChild(btnEdit);
                td.appendChild(btnDel);
            } else showToast(result.error || 'Error al reactivar.');
        } catch (err) {
            console.error(err);
            showToast('Error de conexión al reactivar.');
        }
    }
});
