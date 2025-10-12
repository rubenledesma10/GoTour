const tbody = document.querySelector('tbody');

if (tbody) {
    tbody.addEventListener('click', async e => {
        const row = e.target.closest('tr');
        if (!row || !row.dataset.id) return;
        const id = row.dataset.id;

        if (e.target.classList.contains('btnEdit')) {
            const data = {
                nationality: prompt('Nacionalidad', row.children[0].innerText),
                province: prompt('Provincia', row.children[1].innerText),
                quantity: prompt('Cantidad', row.children[2].innerText),
                mobility: prompt('Movilidad', row.children[3].innerText),
                person_with_disability: prompt('Personas con discapacidad', row.children[4].innerText)
            };

            // Eliminar valores null si el usuario cancela
            for (let key in data) if (data[key] === null) delete data[key];

            try {
                const res = await fetch(`${baseApiUrl}/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (res.ok) location.reload();
                else alert(result.error || 'Error al actualizar');
            } catch (err) {
                alert('Error de conexión al actualizar');
                console.error(err);
            }
        }
    });
}
