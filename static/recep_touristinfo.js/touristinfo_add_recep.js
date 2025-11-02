const baseApiUrl = '/api/touristinfo_recep';
const token = localStorage.getItem('token');
const formAdd = document.getElementById('formAddTourist');

if (formAdd) {
    formAdd.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {
            nationality: formAdd.nationality.value,
            province: formAdd.province.value,
            quantity: parseInt(formAdd.quantity.value),
            person_with_disability: parseInt(formAdd.person_with_disability.value),
            mobility: formAdd.mobility.value
        };

        try {
            const res = await fetch(`${baseApiUrl}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) location.reload();
            else showToast(result.error || 'Error al agregar');
        } catch (err) {
            console.error(err);
            showToast('Error de conexión al agregar');
        }
    });
}
