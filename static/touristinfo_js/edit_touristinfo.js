document.querySelectorAll('.btnEdit').forEach(btn => {
    btn.addEventListener('click', async e => {
        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const token = localStorage.getItem('token');

        const data = {
            nationality: prompt('Nacionalidad', row.children[0].innerText),
            province: prompt('Provincia', row.children[1].innerText),
            quantity: prompt('Cantidad', row.children[2].innerText),
            mobility: prompt('Movilidad', row.children[3].innerText),
            person_with_disability: prompt('Personas con discapacidad', row.children[4].innerText)
        };

        try {
            const res = await fetch(`/api/touristinfo/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });

            if (res.ok) location.reload();
            else {
                const err = await res.json();
                alert(err.error || 'Error al actualizar');
            }
        } catch (err) {
            alert('Error al actualizar');
        }
    });
});
