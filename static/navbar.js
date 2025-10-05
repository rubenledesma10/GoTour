document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("authButton");
    const roleLinks = document.querySelectorAll('[data-role]');
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const myDataBtn = document.getElementById("myDataBtn");

    if (username && role) {
        //mostrar u ocultar links según rol
        roleLinks.forEach(link => {
            const allowedRoles = link.dataset.role.split(",");
            link.classList.toggle("d-none", !allowedRoles.includes(role));
        });

        //esta validacion es para el boton "Mis datos".
        if (role === "tourist") {
            myDataBtn.href = "/api/tourist/users_page";
            myDataBtn.classList.remove("d-none");
        } else if (role === "receptionist") {
            myDataBtn.href = "/api/recepcionist/my_data_view";
            myDataBtn.classList.remove("d-none");
        } else {
            myDataBtn.classList.add("d-none");
        }

        //configurar botón de cerrar sesión
        authButton.textContent = `Cerrar Sesión (${username})`;
        authButton.style.backgroundColor = "red";
        authButton.style.color = "white";
        authButton.href = "#";

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
    }
});