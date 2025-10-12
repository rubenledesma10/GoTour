const baseApiUrl = '/api/touristinfo_recep';
const token = localStorage.getItem('token');

const formAdd = document.getElementById('formAddTourist');
const btnShowAdd = document.getElementById('btnShowAdd');
const addFormContainer = document.getElementById('addFormContainer');
const btnCancelAdd = document.getElementById('btnCancelAdd');

if (btnShowAdd && addFormContainer && btnCancelAdd) {
    btnShowAdd.addEventListener('click', () => {
        addFormContainer.classList.remove('d-none');
        window.scrollTo({ top: addFormContainer.offsetTop, behavior: 'smooth' });
    });

    btnCancelAdd.addEventListener('click', () => {
        addFormContainer.classList.add('d-none');
    });
}

if (formAdd) {
    formAdd.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {
            nationality: formAdd.nationality.value,
            province: formAdd.province.value,
            quantity: formAdd.quantity.value,
            person_with_disability: formAdd.person_with_disability.value,
            mobility: formAdd.mobility.value
        };

        try {
            const res = await fetch(baseApiUrl + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) location.reload();
            else alert(result.error || 'Error al agregar');
        } catch (err) {
            alert('Error de conexión al agregar');
            console.error(err);
        }
    });
}
