document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addFormContainer');
    const editForm = document.getElementById('editFormContainer');
    const token = localStorage.getItem('token');
    const baseApiUrl = '/api/touristinfo_recep';

    if (!token) console.error("No se encontró token en localStorage");

    // Mostrar / ocultar formulario agregar
    document.getElementById('btnShowAdd').addEventListener('click', () => addForm.style.display = 'block');
    document.getElementById('btnCancelAdd').addEventListener('click', () => addForm.style.display = 'none');

    // Abrir formulario editar y rellenar campos
    document.querySelectorAll('.btnEdit').forEach(btn => {
        btn.addEventListener('click', e => {
            const row = e.target.closest('tr');
            if (!row || !row.dataset.id) return;

            document.getElementById('editId').value = row.dataset.id;
            document.getElementById('editNationality').value = row.children[0].innerText.trim();
            document.getElementById('editProvince').value = row.children[1].innerText.trim();
            document.getElementById('editQuantity').value = row.children[2].innerText.trim();
            document.getElementById('editMobility').value = row.children[3].innerText.trim();
            document.getElementById('editDisability').value = row.children[4].innerText.trim();

            editForm.style.display = 'block';
        });
    });

    // Cancelar edición
    document.getElementById('btnCancelEdit').addEventListener('click', () => editForm.style.display = 'none');

    // Enviar formulario de edición
    document.getElementById('formEditTourist').addEventListener('submit', async e => {
        e.preventDefault();

        const id = document.getElementById('editId').value;
        if (!id) {
            alert("No se pudo obtener el ID del turista.");
            return;
        }

        const formData = new FormData();
        formData.append('nationality', document.getElementById('editNationality').value.trim());
        formData.append('province', document.getElementById('editProvince').value.trim());
        formData.append('quantity', document.getElementById('editQuantity').value || 0);
        formData.append('mobility', document.getElementById('editMobility').value.trim());
        formData.append('person_with_disability', document.getElementById('editDisability').value || 0);

        try {
            const res = await fetch(`${baseApiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await res.json();
            if (res.ok) {
                console.log("Actualización exitosa:", result);
                location.reload();
            } else {
                console.error("Error al actualizar:", result);
                alert(result.error || 'Error al actualizar');
            }
        } catch (err) {
            console.error("Error de conexión al actualizar:", err);
            alert('Error de conexión al actualizar');
        }
    });
});
