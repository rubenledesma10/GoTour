document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ tourist_site_edit.js cargado");

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // ============ ACCESS CONTROL ============
  if (!token) {
    showToastReload("Debes iniciar sesión.", "/login");
    return;
  }

  if (role !== "admin") {
    showToastReload(
      "No tienes permiso para editar sitios.",
      "/tourist_sites/view"
    );
    return;
  }

  // ============ FORM ELEMENTS ============
  const siteSelect = document.getElementById("siteSelect");
  const form = document.getElementById("editTouristSiteForm");
  const cancelButton = document.getElementById("cancelButton");

  const currentImage = document.getElementById("currentImage");
  const noImageText = document.getElementById("noImageText");
  const previewImage = document.getElementById("previewImage");
  const photoInput = document.getElementById("photo");
  const noNewImageText = document.getElementById("noNewImageText");

  const addressInput = document.getElementById("address");
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");

  // ============ IMAGE PREVIEW ============
  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (r) => {
          previewImage.src = r.target.result;
          previewImage.style.display = "block";
          noNewImageText.style.display = "none";
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.style.display = "none";
        noNewImageText.style.display = "block";
      }
    });
  }

  // ============ CANCEL BUTTON ============
  cancelButton.addEventListener("click", async () => {
    const confirm = await showToastConfirm("¿Cancelar y volver?");
    if (confirm) window.location.href = "/tourist_sites/view";
  });

  // ============ LOAD SITE DATA ============
  siteSelect.addEventListener("change", async (e) => {
    const id = e.target.value;
    if (!id) {
      form.reset();
      previewImage.style.display = "none";
      currentImage.style.display = "none";
      noImageText.style.display = "block";
      // Limpio también lat/lng
      if (latInput) latInput.value = "";
      if (lngInput) lngInput.value = "";
      return;
    }

    try {
      const res = await fetch(`/api/tourist_sites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // Fill fields
      document.getElementById("name").value = data.name;
      document.getElementById("description").value = data.description;
      document.getElementById("address").value = data.address;
      document.getElementById("phone").value = data.phone;
      document.getElementById("category").value = data.category;
      document.getElementById("url").value = data.url;
      document.getElementById("average").value = data.average;
      document.getElementById("opening_hours").value =
        data.opening_hours?.substring(0, 5);
      document.getElementById("closing_hours").value =
        data.closing_hours?.substring(0, 5);

      // 🖼️ Imagen actual
      if (data.photo) {
        currentImage.src = data.photo;
        currentImage.style.display = "block";
        noImageText.style.display = "none";
      } else {
        currentImage.style.display = "none";
        noImageText.style.display = "block";
      }

      previewImage.style.display = "none";
      photoInput.value = "";

      // setear lat/lng y mover el pin en el mapa
      if (typeof window.setPoint === "function") {
        const hasLat = typeof data.lat === "number" && !Number.isNaN(data.lat);
        const hasLng = typeof data.lng === "number" && !Number.isNaN(data.lng);

        if (latInput) latInput.value = hasLat ? data.lat.toFixed(6) : "";
        if (lngInput) lngInput.value = hasLng ? data.lng.toFixed(6) : "";

        if (hasLat && hasLng) {
          // Si el sitio tiene coords, centramos el mapa y marcador ahí
          window.setPoint(data.lat, data.lng);
          const note = document.getElementById("geo-note");
          if (note)
            note.textContent =
              "Ubicación cargada desde el sitio. Podés ajustar el pin arrastrándolo.";
        } else {
          // Si no hay coords guardadas, forzamos geocodificar por la dirección
          // (disparamos el 'input' para que el debounce de form_geocode.js haga el fetch)
          if (addressInput) {
            addressInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      } else {
        console.warn(
          "setPoint no está disponible. ¿Se cargó form_geocode.js antes que este script?"
        );
      }
    } catch {
      showToast("Error cargando datos del sitio");
    }
  });

  // ============ SAVE ============
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = siteSelect.value;
    if (!id) return showToast("Selecciona un sitio");

    const confirm = await showToastConfirm("¿Guardar cambios?");
    if (!confirm) return;

    const formData = new FormData(form);
    // Aseguramos incluir las coords 
    if (latInput && !formData.has("lat"))
      formData.append("lat", latInput.value || "");
    if (lngInput && !formData.has("lng"))
      formData.append("lng", lngInput.value || "");

    try {
      const res = await fetch(`/api/tourist_sites/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        // ✅ muestra un toast breve y redirige automáticamente
        showToast("✅ Sitio actualizado con éxito. Redirigiendo…");
        setTimeout(() => {
          window.location.href = "/tourist_sites/view";
        }, 1200);
      } else {
        showToast("Error: " + (result.error || result.message));
      }
    } catch {
      showToast("Error al actualizar el sitio");
    }
  });

  // ========= TOAST FUNCTIONS =========
  function showToast(message) {
    const toastEl = document.getElementById("liveToast");
    const msg = document.getElementById("toastMessage");
    const buttons = document.getElementById("toastButtons");

    msg.textContent = message;
    buttons.innerHTML = ""; // no botones

    toastEl.style.background = "#fff";
    toastEl.style.color = "#000";

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4500 });
    toast.show();
  }

  function showToastReload(message, redirect) {
    const toastEl = document.getElementById("liveToast");
    const msg = document.getElementById("toastMessage");
    const buttons = document.getElementById("toastButtons");

    msg.textContent = message;
    buttons.innerHTML = `
      <button id="toastAccept" class="btn btn-success btn-sm me-2">Aceptar</button>
    `;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
      autohide: false,
    });
    toast.show();

    document.getElementById("toastAccept").onclick = () => {
      toast.hide();
      window.location.href = redirect;
    };
  }

  function showToastConfirm(message) {
    return new Promise((resolve) => {
      const toastEl = document.getElementById("liveToast");
      const msg = document.getElementById("toastMessage");
      const buttons = document.getElementById("toastButtons");

      msg.textContent = message;
      buttons.innerHTML = `
        <button id="yesBtn" class="btn btn-success btn-sm me-2">Sí</button>
        <button id="noBtn" class="btn btn-secondary btn-sm">No</button>
      `;

      const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
        autohide: false,
      });
      toast.show();

      document.getElementById("yesBtn").onclick = () => {
        toast.hide();
        resolve(true);
      };
      document.getElementById("noBtn").onclick = () => {
        toast.hide();
        resolve(false);
      };
    });
  }
});
