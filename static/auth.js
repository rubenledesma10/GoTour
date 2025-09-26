
document.addEventListener("DOMContentLoaded", () => {


    //formulario de registro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm); //convierte los datos del formulario en un objeto que se puede enviar con fetch
            formData.set("role", "tourist"); //de esta forma hacemos que si o si sea turista el que se registre por aca

            try {
                const res = await fetch('/api/gotour/register', {
                    method: "POST",
                    body: formData
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
                    localStorage.setItem("role", result.role);
                    localStorage.setItem("username", result.username);
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

    const forgot_passwordForm=document.getElementById("forgot_passwordForm");
    if (forgot_passwordForm) {
        forgot_passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
                email: form.email.value,
            };

            try {
                const res = await fetch('/api/gotour/forgot-password', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                if (result.message) {
                    alert("Password recuperity. Review email");
                    window.location.href = "/api/gotour/login";
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

