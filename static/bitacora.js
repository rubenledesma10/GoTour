
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        showToastReload("Session expired. Please login again.", "/");
        return;
    }

    fetch("/api/admin/audit-logs", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al cargar la bitácora");
        return res.json();
    })
    .then(logs => {
        const rowsPerPage = 10;
        let currentPage = 1;
        const tbody = document.querySelector("#auditLogsTable tbody");
        const pagination = document.getElementById("pagination");

        function renderTablePage(page) {
            tbody.innerHTML = "";
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const pageLogs = logs.slice(start, end);

            pageLogs.forEach(log => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${log.id}</td>
                    <td>${log.user}</td>
                    <td>${log.action}</td>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                `;
                tbody.appendChild(row);
            });

            renderPagination();
        }

        function renderPagination() {
            pagination.innerHTML = "";
            const pageCount = Math.ceil(logs.length / rowsPerPage);

            // Botón "Anterior"
            const prevLi = document.createElement("li");
            prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
            prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
            prevLi.addEventListener("click", e => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    renderTablePage(currentPage);
                }
            });
            pagination.appendChild(prevLi);

            // Botones de páginas
            for (let i = 1; i <= pageCount; i++) {
                const li = document.createElement("li");
                li.className = `page-item ${i === currentPage ? "active" : ""}`;
                li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                li.addEventListener("click", e => {
                    e.preventDefault();
                    currentPage = i;
                    renderTablePage(currentPage);
                });
                pagination.appendChild(li);
            }

            // Botón "Siguiente"
            const nextLi = document.createElement("li");
            nextLi.className = `page-item ${currentPage === pageCount ? "disabled" : ""}`;
            nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
            nextLi.addEventListener("click", e => {
                e.preventDefault();
                if (currentPage < pageCount) {
                    currentPage++;
                    renderTablePage(currentPage);
                }
            });
            pagination.appendChild(nextLi);
        }

        // Render inicial
        renderTablePage(currentPage);
    })
    .catch(err => {
        console.error(err);
        showToast("No se pudo cargar la bitácora", 5000);
    });
});

// -----------------------------
// Función toast arriba derecha
function showToast(message, duration = 5000) {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: true, delay: duration });
    toast.show();
}

// Función para recargar la página en caso de sesión expirada
function showToastReload(message, redirectUrl = "/") {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message}
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: false });
    toast.show();

    const acceptBtn = document.getElementById('toastAccept');
    acceptBtn.addEventListener('click', () => {
        toast.hide();
        location.href = redirectUrl;
    }, { once: true });
}
