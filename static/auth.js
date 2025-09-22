// document.getElementById("registerForm").addEventListener("submit", async(e) => {
//     e.preventDefault(); 
//     const form = e.target;
//     const data = {
//         first_name: form.first_name.value,
//         last_name: form.last_name.value,
//         email: form.email.value,
//         password: form.password.value,
//         username: form.username.value,
//         rol: form.rol.value,
//         dni: form.dni.value,
//         birthdate: form.birthdate.value,
//         photo: null,  // aún no subimos archivos
//         phone: form.phone.value,
//         nationality: form.nationality.value,
//         province: form.province.value,
//         is_activate: true
//     };

//     try {
//         const res = await fetch('/api/gotour/register', {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });

//         const result = await res.json();
//         if (res.ok) {
//             alert("User registered! Please login.");
//             window.location.href = "/api/gotour/login";
//         } else {
//             alert(result.error || result.message);
//         }
//     } catch (error) {
//         console.error('Request error:', error);
//         alert('An error occurred while registering the user');
//     }
// });

// document.getElementById("loginForm").addEventListener("submit", async(e) => {
//     e.preventDefault(); 
//     const form = e.target;
//     const data = {
//         email: form.email.value,
//         password: form.password.value,
//     };

//     try {
//         const res = await fetch('/api/gotour/login', {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });

//         const result = await res.json();
//         if (res.ok) {
//             alert("Login successful! Welcome.");
//             localStorage.setItem("access_token", result.access_token);
//             localStorage.setItem("role", result.role);
//             localStorage.setItem("username", result.username);
//             window.location.href = "/";
//         } else {
//             alert(result.error || result.message);
//         }
//     } catch (error) {
//         console.error('Request error:', error);
//         alert('An error occurred while login the user');
//     }
// });

document.addEventListener("DOMContentLoaded", () => {
    //formulario de registro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
                first_name: form.first_name.value,
                last_name: form.last_name.value,
                email: form.email.value,
                password: form.password.value,
                username: form.username.value,
                rol: form.rol.value,
                dni: form.dni.value,
                birthdate: form.birthdate.value,
                photo: null, // aún no subimos archivos
                phone: form.phone.value,
                nationality: form.nationality.value,
                province: form.province.value,
                is_activate: true
            };

            try {
                const res = await fetch('/api/gotour/register', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (res.ok) {
                    alert("User registered! Please login.");
                    window.location.href = "/api/gotour/login";
                } else {
                    alert(result.error || result.message);
                }
            } catch (error) {
                console.error('Request error:', error);
                alert('An error occurred while registering the user');
            }
        });
    }

    //formulario de login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
                email: form.email.value,
                password: form.password.value,
            };

            try {
                const res = await fetch('/api/gotour/login', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (res.ok) {
                    alert("Login successful! Welcome.");
                    localStorage.setItem("access_token", result.access_token);
                    localStorage.setItem("role", result.role || "");
                    localStorage.setItem("username", result.username || "");
                    window.location.href = "/";
                } else {
                    alert(result.error || result.message);
                }
            } catch (error) {
                console.error('Request error:', error);
                alert('An error occurred while login the user');
            }
        });
    }
});

