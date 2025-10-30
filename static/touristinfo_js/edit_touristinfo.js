// Mostrar formulario de edición y rellenar campos
document.querySelectorAll('.btnEdit').forEach(btn => {
    btn.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const id = row.dataset.id;

        // Mostrar formulario
        const formContainer = document.getElementById('editFormContainer');
        formContainer.classList.remove('d-none');

        // Rellenar campos
        document.getElementById('editId').value = id;
        document.getElementById('editNationality').value = row.children[0].innerText;
        document.getElementById('editProvince').value = row.children[1].innerText;
        document.getElementById('editQuantity').value = row.children[2].innerText;
        document.getElementById('editMobility').value = row.children[3].innerText;
        document.getElementById('editDisability').value = row.children[4].innerText;
    });
});

// Cancelar edición
document.getElementById('btnCancelEdit').addEventListener('click', () => {
    document.getElementById('editFormContainer').classList.add('d-none');
});

// Enviar formulario
document.getElementById('formEditTourist').addEventListener('submit', async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('editId').value;

    const data = {
        nationality: document.getElementById('editNationality').value,
        province: document.getElementById('editProvince').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        mobility: document.getElementById('editMobility').value,
        person_with_disability: parseInt(document.getElementById('editDisability').value)
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
