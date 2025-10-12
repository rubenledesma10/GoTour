document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("authButton");
    const roleLinks = document.querySelectorAll('[data-role]');
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const myDataBtn = document.getElementById("myDataBtn");
    const btnAuditLogs = document.getElementById("btnAuditLogs");

    // --- Configuración de usuario y roles ---
    if (username && role) {
        // Mostrar u ocultar links según rol
        roleLinks.forEach(link => {
            const allowedRoles = link.dataset.role.split(",");
            link.classList.toggle("d-none", !allowedRoles.includes(role));
        });

        // Configurar botón "Mis datos"
        if (role === "tourist") {
            myDataBtn.href = "/api/tourist/users_page";
            myDataBtn.classList.remove("d-none");
        } else if (role === "receptionist") {
            myDataBtn.href = "/api/recepcionist/users_page";
            myDataBtn.classList.remove("d-none");
        } else {
            myDataBtn.classList.add("d-none");
        }

        // Configurar botón cerrar sesión
        authButton.textContent = `Cerrar Sesión (${username})`;
        authButton.style.backgroundColor = "red";
        authButton.style.color = "white";
        authButton.href = "#";
        authButton.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/";
        };

        // Mostrar botón Bitácora solo para admin
        if (btnAuditLogs && role === "admin") {
            btnAuditLogs.classList.remove("d-none");
            // El href ya apunta a la página /audit-logs-page
        }
    } else {
        // Usuario no logueado
        roleLinks.forEach(link => link.classList.add("d-none"));
        authButton.textContent = "Registrarse/Iniciar Sesión";
        authButton.style.backgroundColor = "orange";
        authButton.style.color = "white";
    }

    // --- Función para mostrar toast con botón aceptar ---
    function showToastReload(message, redirectUrl = null) {
        const toastEl = document.getElementById('liveToast');
        const toastMessage = document.getElementById('toastMessage');

        toastMessage.innerHTML = `
            ${message}
            <div class="mt-2 pt-2 border-top">
                <button type="button" class="btn btn-primary btn-sm" id="toastAcceptBtn">Aceptar</button>
            </div>
        `;

        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        document.getElementById("toastAcceptBtn").onclick = () => {
            toast.hide();
            if (redirectUrl) window.location.href = redirectUrl;
            else window.location.reload();
        };
    }
});
