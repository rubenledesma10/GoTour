
const authButton = document.getElementById("authButton"); //accedemos al boton
const roleLinks = document.querySelectorAll('[data-role]'); //accedemos al permiso


const userRole = localStorage.getItem("role"); //obtenemos el rol del usario
const username = localStorage.getItem("username"); //obtenemos el username del rol


if (userRole && username) { //verifica si hay un usuario logueado, y que rol y username tienen
    roleLinks.forEach(link => { //recorremos todos los data-role
        const allowedRoles = link.dataset.role.split(","); //aca nos devuelve lo que pusimos en data role y con el split lo convierte en un array
        if (allowedRoles.includes(userRole)) { //comprobamos si el rol esta dentro de allowedRoles y nos devuelve un true
            link.classList.remove("d-none"); //si el rol coincide eliminamos el d-none
        } else {
            link.classList.add("d-none"); //si no cooincide lo agrega
        }
    });
    
    authButton.textContent = `Cerrar Sesión (${username})`; //cambiamos el texto a Cerrar sesion
    authButton.href = "#"; // le decimos que se quede aca hasta que nosotros le indiquemos 
    authButton.style.backgroundColor = "red"; //le agregamos el color rojo
    authButton.style.color = "white"; //letra blanca
  
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
   
    roleLinks.forEach(link => {
        link.classList.add("d-none");
    });
    
    authButton.textContent = "Registrarse/Iniciar Sesión";

}