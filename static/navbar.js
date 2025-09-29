document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("authButton");
    const roleLinks = document.querySelectorAll('[data-role]');
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (username && role) {
        // Mostrar u ocultar links según rol
        roleLinks.forEach(link => {
            const allowedRoles = link.dataset.role.split(",");
            link.classList.toggle("d-none", !allowedRoles.includes(role));
        });

        // Configurar botón de cerrar sesión
        authButton.textContent = `Cerrar Sesión (${username})`;
        authButton.style.backgroundColor = "red";
        authButton.style.color = "white";
        authButton.href = "#";

 features/user
        authButton.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/";
        };
    } else {
        // Usuario no logueado
        roleLinks.forEach(link => link.classList.add("d-none"));
        authButton.textContent = "Registrarse/Iniciar Sesión";
        authButton.style.backgroundColor = "orange";
        authButton.style.color = "white";
        // apunta a tu ruta real
    }
});
