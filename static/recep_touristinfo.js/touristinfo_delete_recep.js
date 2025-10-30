// document.addEventListener('DOMContentLoaded', () => {
//     console.log("Módulo de eliminación de turistas cargado");

//     const tbody = document.querySelector('tbody');
//     const token = localStorage.getItem('token');
//     const baseApiUrl = '/api/touristinfo_recep';

//     if (!token) {
//         alert("No hay token de acceso válido. Por favor, inicia sesión.");
//         return;
//     }

//     const role = (localStorage.getItem('role') || '').toLowerCase();
//     if (role !== 'receptionist') {
//         alert("No tenés permisos para eliminar turistas.");
//         return;
//     }

//     if (!tbody) return;

//     tbody.addEventListener('click', async e => {
//         const row = e.target.closest('tr');
//         if (!row || !row.dataset.id) return;
//         const id = row.dataset.id;

//         if (e.target.classList.contains('btnDelete')) {
//             // if (!confirm('¿Seguro que querés eliminar este turista?')) return;

//             try {
//                 const res = await fetch(`${baseApiUrl}/${id}`, {
//                     method: 'DELETE',
//                     headers: { 'Authorization': `Bearer ${token}` }
//                 });

//                 const result = await res.json();

//                 if (res.ok) {
//                     alert('Turista eliminado (marcado como inactivo) correctamente.');
//                     location.reload();
//                 } else {
//                     alert(result.error || 'Error al eliminar');
//                 }
//             } catch (err) {
//                 console.error('Error al eliminar:', err);
//                 alert('Error de conexión al eliminar');
//             }
//         }
//     });
// });
