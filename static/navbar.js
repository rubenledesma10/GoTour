
const authButton = document.getElementById("authButton"); //accedemos al boton
const adminLinks = document.querySelectorAll('[data-role="admin"]'); //accedemos al permiso


const userRole = localStorage.getItem("role"); //obtenemos el rol del usario
const username = localStorage.getItem("username"); //obtenemos el username del rol


if (userRole && username) { //si tenemos el rol y el username del rol 
    if (userRole == "admin") { //si el usuario es igual a administrador
        adminLinks.forEach(link => {
            link.classList.remove("d-none"); // eliminamos el atributo d-none de la botonera para mostrar los botones
        });
    }
    
    authButton.textContent = `Cerrar Sesión (${username})`; //cambiamos el texto a Cerrar sesion
    authButton.href = "#"; // le decimos que se quede aca hasta que nosotros le indiquemos 

  
    authButton.addEventListener("click", (e) => {
        e.preventDefault();
        //eliminamos el localstorage y cerramos sesion
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        
        //redirigimos a la pagina inicial 
        window.location.href = "/"; 
    });

} else {
   
    adminLinks.forEach(link => {
        link.classList.add("d-none");
    });
    
    authButton.textContent = "Registrarse/Iniciar Sesión";

}