document.getElementById('formEditTourist')?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('editId').value;
    if (!id) return showToast('No se pudo obtener el ID del turista.');

    const formData = new FormData();
    formData.append('nationality', document.getElementById('editNationality').value.trim());
    formData.append('province', document.getElementById('editProvince').value.trim());
    formData.append('quantity', parseInt(document.getElementById('editQuantity').value) || 0);
    formData.append('mobility', document.getElementById('editMobility').value.trim());
    formData.append('person_with_disability', parseInt(document.getElementById('editDisability').value) || 0);

    try {
        const res = await fetch(`/api/touristinfo_recep/${id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const result = await res.json();
        if (res.ok) location.reload();
        else showToast(result.error || 'Error al actualizar');
    } catch (err) {
        console.error(err);
        showToast('Error de conexión al actualizar');
    }
});
