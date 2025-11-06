// Toast reutilizable
function showToastReload(message, redirectUrl = null) {
  const toastEl = document.getElementById("liveToast");
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.innerHTML = `
      ${message} 
      <div class="mt-2 text-center">
          <button id="toastAccept" class="btn btn-sm btn-primary">Aceptar</button>
      </div>
  `;

  toastEl.className = `toast align-items-center border border-secondary`;
  toastEl.style.backgroundColor = "#ffffff";
  toastEl.style.color = "#000000";
  toastEl.style.borderRadius = "0.5rem";
  toastEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";

  const toast = new bootstrap.Toast(toastEl, { autohide: false });
  toast.show();

  document.getElementById("toastAccept").addEventListener("click", () => {
    toast.hide();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.reload();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No token encontrado. Redirigiendo...");
    window.location.href = "/";
    return;
  }

  // === CARGA DE PAÍSES Y PROVINCIAS ===
  const countrySelect = document.getElementById("countrySelect");
  const stateSelect = document.getElementById("stateSelect");

  if (countrySelect && stateSelect) {
    fetch("/static/countries+states.json")
      .then((res) => res.json())
      .then((data) => {
        window.countriesData = data;
        data.forEach((country) => {
          const option = document.createElement("option");
          option.value = country.name;
          option.textContent = country.name;
          countrySelect.appendChild(option);
        });
      })
      .catch((err) => console.error("Error cargando países:", err));

    countrySelect.addEventListener("change", () => {
      const selectedCountry = countrySelect.value;
      stateSelect.innerHTML =
        '<option value="" disabled selected>Seleccione una provincia</option>';
      const country = window.countriesData.find((c) => c.name === selectedCountry);
      if (!country) return;

      if (country.states.length === 0) {
        const opt = document.createElement("option");
        opt.value = "Sin provincias";
        opt.textContent = "Sin provincias";
        stateSelect.appendChild(opt);
      } else {
        country.states.forEach((state) => {
          const option = document.createElement("option");
          option.value = state;
          option.textContent = state;
          stateSelect.appendChild(option);
        });
      }
    });
  }

  

  // === FORMULARIO DE REGISTRO ADMIN ===
  const registerAdminForm = document.getElementById("registerAdminForm");
  if (!registerAdminForm) return;

  registerAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const passwordRepeat = document.getElementById("password_repeat").value;
    const passwordMsg = document.getElementById("passwordMatchMsg");

    if (password !== passwordRepeat) {
      passwordMsg.classList.remove("d-none");
      return; // No enviamos el formulario
    } else {
      passwordMsg.classList.add("d-none");
    }
    const formData = new FormData(registerAdminForm);
    formData.delete("password_repeat")
    const statusEl = document.getElementById("emailStatus");

    if (statusEl) {
      statusEl.innerText = "Enviando correo...";
      statusEl.style.color = "orange";
    }

    try {
      const res = await fetch("/api/admin/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        if (statusEl) {
          statusEl.innerText = "Usuario creado ✅";
          statusEl.style.color = "green";
        }

        showToastReload("Usuario registrado correctamente!", "/api/admin/users_page");
        registerAdminForm.reset();
      } else {
        if (statusEl) {
          statusEl.innerText = "Error al registrar ❌";
          statusEl.style.color = "red";
        }
        showToastReload(result.error || result.message);
      }
    } catch (err) {
      console.error(err);
      if (statusEl) {
        statusEl.innerText = "Error en el servidor ❌";
        statusEl.style.color = "red";
      }
      showToastReload("Error al registrar usuario");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // 👁 Mostrar/ocultar contraseñas
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const icon  = btn.querySelector("i");
      const isPwd = input.type === "password";
      input.type  = isPwd ? "text" : "password";
      icon.classList.toggle("bi-eye", !isPwd);
      icon.classList.toggle("bi-eye-slash", isPwd);
    });
  });

  // Validación de coincidencia
  const pass   = document.getElementById("password");
  const repeat = document.getElementById("password_repeat");
  const msg    = document.getElementById("passwordMatchMsg");

  function checkMatch() {
    if (!repeat.value) { msg.classList.add("d-none"); repeat.setCustomValidity(""); return; }
    if (pass.value === repeat.value) {
      msg.classList.add("d-none");
      repeat.setCustomValidity("");
    } else {
      msg.classList.remove("d-none");
      repeat.setCustomValidity("Las contraseñas no coinciden");
    }
  }

  pass.addEventListener("input", checkMatch);
  repeat.addEventListener("input", checkMatch);
});
