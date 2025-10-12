document.getElementById('formAddTourist').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const data = {
        nationality: document.getElementById('nationality').value,
        province: document.getElementById('province').value,
        quantity: document.getElementById('quantity').value,
        person_with_disability: document.getElementById('person_with_disability').value,
        mobility: document.getElementById('mobility').value
    };

    try {
        const res = await fetch('/api/touristinfo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) location.reload();
        else {
            const err = await res.json();
            alert(err.error || 'Error al agregar');
        }
    } catch (err) {
        alert('Error al agregar');
    }
});
