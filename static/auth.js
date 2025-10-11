// Función para mostrar un toast que recarga/redirige al cerrarse
function showToastReload(message, redirectUrl = "/") {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.innerHTML = `
        ${message} 
        <div class="mt-2 text-center">
            <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
        </div>
    `;

    // Fondo blanco, texto negro y borde
    toastEl.className = `toast align-items-center border border-secondary`;
    toastEl.style.backgroundColor = "#ffffff";
    toastEl.style.color = "#000000";
    toastEl.style.borderRadius = "0.5rem";
    toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

    const toast = new bootstrap.Toast(toastEl, { autohide: false });
    toast.show();

    document.getElementById('toastAccept').addEventListener('click', () => {
        toast.hide();
        window.location.href = redirectUrl;
    });
}

document.addEventListener("DOMContentLoaded", () => {

    const countrySelect = document.getElementById("countrySelect");
    const stateSelect = document.getElementById("stateSelect");

    if (countrySelect && stateSelect) {
        fetch("/static/countries+states.json")
            .then(res => res.json())
            .then(data => {
                window.countriesData = data;
                // Llenar select de países
                data.forEach(country => {
                    const option = document.createElement("option");
                    option.value = country.name;
                    option.textContent = country.name;
                    countrySelect.appendChild(option);
                });
            })
            .catch(err => console.error("Error cargando países:", err));

        countrySelect.addEventListener("change", () => {
            const selectedCountry = countrySelect.value;
            stateSelect.innerHTML = '<option value="" disabled selected>Seleccione una provincia</option>';
            if (!selectedCountry) return;

            const country = window.countriesData.find(c => c.name === selectedCountry);
            if (!country) return;

            country.states.forEach(state => {
                const option = document.createElement("option");
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        });
    }

    // formulario de registro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            formData.set("role", "tourist");
            const statusEl = document.getElementById("emailStatus");
            if (statusEl) {
                statusEl.innerText = "Enviando correo...";
                statusEl.style.color = "orange";
            }
            try {
                const res = await fetch('/api/gotour/register', {
                    method: "POST",
                    body: formData
                });
                
                const result = await res.json();
                if (res.ok) {
                    if (statusEl) {
                        statusEl.innerText = "Correo enviado ✅";
                        statusEl.style.color = "green";
                    }
                    showToastReload("Usuario registrado con éxito. Revisá tu correo.", "/api/gotour/login");
                } else {
                    if (statusEl) {
                        statusEl.innerText = "Error al enviar el correo ❌";
                        statusEl.style.color = "red";
                    }
                    showToastReload(result.error || result.message);
                }
            } catch (error) {
                console.error('Request error:', error);
                if (statusEl) {
                    statusEl.innerText = "Error en el servidor ❌";
                    statusEl.style.color = "red";
                }
                showToastReload('An error occurred while registering the user');
            }
        });
    }

    // formulario de login
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
                    localStorage.setItem("token", result.token);
                    localStorage.setItem("role", result.role);
                    localStorage.setItem("username", result.username);
                    showToastReload("Login successful! Welcome.", "/");
                } else {
                    showToastReload(result.error || result.message);
                }
            } catch (error) {
                console.error('Request error:', error);
                showToastReload('An error occurred while login the user');
            }
        });
    }

    // formulario de olvidé mi contraseña
    const forgot_passwordForm = document.getElementById("forgot_passwordForm");
    if (forgot_passwordForm) {
        forgot_passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = { email: form.email.value };
            const statusEl = document.getElementById("emailStatus");
            statusEl.innerText = "Enviando correo...";
            try {
                const res = await fetch('/api/gotour/forgot-password', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (res.ok) {
                    statusEl.innerText = "Correo enviado ✅";
                    statusEl.style.color = "green";
                    showToastReload("Correo enviado correctamente.", "/api/gotour/login");
                } else {
                    statusEl.innerText = "Error al enviar correo ❌";
                    console.error(result.error || result.message);
                    showToastReload(result.error || result.message);
                }
            } catch (error) {
                statusEl.innerText = "Error de red ❌";
                console.error(error);
                showToastReload("Error de red o servidor.");
            }
        });
    }

    // formulario de reactivación de cuenta
    const reactivateForm = document.getElementById("reactivateForm");
    if (reactivateForm) {
        reactivateForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = { email: form.email.value };
            const statusEl = document.getElementById("emailStatus");
            statusEl.innerText = "Enviando correo...";
            try {
                const res = await fetch('/api/gotour/reactivate-account', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (res.ok) {
                    statusEl.innerText = "Correo enviado ✅";
                    statusEl.style.color = "green";
                    showToastReload("Correo de reactivación enviado.", "/api/gotour/login");
                } else {
                    statusEl.innerText = "Error al enviar correo ❌";
                    console.error(result.error || result.message);
                    showToastReload(result.error || result.message);
                }
            } catch (error) {
                console.error('Request error:', error);
                showToastReload('Error al intentar reactivar la cuenta.');
            }
        });
    }

});
