document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ tourist_sites_view.js cargado correctamente");

  // Autenticación y roles

  const body = document.getElementById("protectedBody");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (body) body.style.display = "block";

  if (!token) {
    console.log("Usuario no autenticado → solo visualiza sitios.");
    document
      .querySelectorAll(".btn-send-comment, .admin-only")
      .forEach((el) => (el.style.display = "none"));
  } else {
    console.log("Usuario autenticado con rol:", role);
    if (role !== "admin") {
      document
        .querySelectorAll(".admin-only")
        .forEach((el) => (el.style.display = "none"));
    }
    if (role === "tourist") {
      document
        .querySelectorAll(".btn-send-comment")
        .forEach((el) => (el.style.display = "inline-block"));
    } else {
      document
        .querySelectorAll(".btn-send-comment")
        .forEach((el) => (el.style.display = "none"));
    }
  }

  // Búsqueda y filtros

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");
  const searchBtn = document.getElementById("btnSearch");
  const container = document.querySelector(".row.row-cols-1");

  if (!container) {
    console.error("❌ No se encontró el contenedor principal de sitios");
    return;
  }

  // Renderizar sitios turísticos

  function renderSites(sites) {
    container.innerHTML = "";

    if (!sites || sites.length === 0) {
      container.innerHTML = `<p class="text-center text-muted mt-3">No se encontraron resultados.</p>`;
      return;
    }

    sites.forEach((site) => {
      let imagePath = "/static/img/no-image.png";
      if (site.photo) {
        if (site.photo.startsWith("/static/")) {
          imagePath = site.photo;
        } else if (site.photo.includes("/")) {
          imagePath = `/static/${site.photo.replace(/^\/?static\//, "")}`;
        } else {
          imagePath = `/static/tourist_sites_images/${site.photo}`;
        }
      }

      // Generar estrellas según el promedio de calificaciones + cantidad de comentarios
      let ratingStars = "";
      if (site.average_rating && site.average_rating > 0) {
        const filledStars = Math.floor(site.average_rating);
        const emptyStars = 5 - filledStars;

        ratingStars += `<p class="text-muted mb-1">
                  <i class="bi bi-star-fill text-warning"></i> Promedio calificaciones: `;

        for (let i = 0; i < filledStars; i++) {
          ratingStars += `<i class="bi bi-star-fill text-warning"></i>`;
        }
        for (let i = 0; i < emptyStars; i++) {
          ratingStars += `<i class="bi bi-star text-muted"></i>`;
        }

        ratingStars += ` (${Number(site.average_rating).toFixed(2)})`;

        // Agregamos la cantidad de comentarios
        const cc = Number(site.comment_count ?? 0);
        ratingStars += ` — <i class="bi bi-chat-dots text-secondary"></i> ${cc} comentario${
          cc === 1 ? "" : "s"
        }`;

        ratingStars += `</p>`;
      } else {
        // Mostrar también cantidad de comentarios aunque no haya calificaciones
        const cc = Number(site.comment_count ?? 0);
        ratingStars = `<p class="text-muted mb-1">
                  <i class="bi bi-star text-muted"></i> Sin calificaciones —
                  <i class="bi bi-chat-dots text-secondary"></i> ${cc} comentario${
          cc === 1 ? "" : "s"
        }
                </p>`;
      }

      // Estado del sitio
      let statusBadge = "";
      if (site.is_activate) {
        statusBadge = `<span class="badge bg-success">Activo</span>`;
      } else {
        statusBadge = `
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-secondary">Inactivo</span>
                        ${
                          role === "admin" && token
                            ? `
                            <button class="btn btn-success btn-sm btn-reactivate" data-id="${site.id_tourist_site}">
                                <i class="bi bi-arrow-clockwise"></i> Reactivar
                            </button>`
                            : ""
                        }
                    </div>`;
      }

      // Botón de comentar (solo turistas logueados y sitio activo)
      const commentButton =
        role === "tourist" && site.is_activate && token
          ? `
                    <a href="/api/feedback/add?site_id=${
                      site.id_tourist_site
                    }&name=${encodeURIComponent(site.name)}"
                    class="btn btn-success btn-sm mb-2 btn-send-comment">
                    <i class="bi bi-chat-dots"></i> Comentar
                    </a>
                `
          : "";

      // Card completa
      const card = `
                <div class="col">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${imagePath}"
                            class="card-img-top site-photo"
                            alt="${site.name}"
                            style="height:200px; object-fit:cover; cursor:pointer;"
                            onerror="this.src='/static/img/no-image.png';"
                            data-bs-toggle="modal"
                            data-bs-target="#imageModal"
                            data-img-src="${imagePath}"
                            data-img-name="${site.name}">
                        <div class="card-body">
                            ${commentButton}
                            <h5 class="card-title text-primary">${
                              site.name
                            }</h5>
                            <p><strong>Descripción:</strong> ${
                              site.description
                            }</p>
                            <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${
                              site.address
                            }</p>
                            <p class="text-muted"><i class="bi bi-clock"></i> ${
                              site.opening_hours
                            } - ${site.closing_hours}</p>
                            <p class="text-muted mb-1"><i class="bi bi-bar-chart-line"></i> Promedio visitas:
                                <strong>${
                                  site.average?.toFixed(2) || "0.00"
                                }</strong>
                            </p>
                            ${ratingStars} <!-- ⭐️ Insertamos el bloque de estrellas -->
                            <p class="text-muted"><i class="bi bi-tag-fill"></i> ${
                              site.category
                            }</p>
                        </div>
                        <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                            ${
                              site.url
                                ? `
                                <a href="${site.url}" target="_blank" class="btn btn-outline-primary btn-sm">
                                    <i class="bi bi-box-arrow-up-right"></i> Ver sitio
                                </a>`
                                : ""
                            }
                            ${statusBadge}
                        </div>
                    </div>
                </div>`;

      container.insertAdjacentHTML("beforeend", card);
    });

    //  Modal de imagen
    document.querySelectorAll(".site-photo").forEach((img) => {
      img.addEventListener("click", () => {
        const modalImage = document.getElementById("modalImage");
        const modalTitle = document.getElementById("imageModalLabel");
        modalImage.src = img.getAttribute("data-img-src");
        modalTitle.textContent = `Vista ampliada - ${img.getAttribute(
          "data-img-name"
        )}`;
      });
    });
  }

  //  Reactivar sitio turístico

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-reactivate");
    if (!btn) return;

    const id = btn.dataset.id;
    const token = localStorage.getItem("token");

    if (btn.dataset.processing === "true") return;
    btn.dataset.processing = "true";

    if (!confirm("¿Deseas reactivar este sitio turístico?")) {
      btn.dataset.processing = "false";
      return;
    }

    try {
      const res = await fetch(`/api/tourist_sites/${id}/reactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Sitio turístico reactivado con éxito");
        searchSites();
      } else {
        alert("⚠️ " + (result.error || result.message));
      }
    } catch (err) {
      console.error("❌ Error al reactivar el sitio:", err);
      alert("Error al intentar reactivar el sitio.");
    } finally {
      btn.dataset.processing = "false";
    }
  });

  //  Buscar sitios con filtros

  async function searchSites() {
    const query = searchInput?.value.trim() || "";
    const category = categoryFilter?.value || "";
    const is_active = statusFilter?.value || "";
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category) params.append("category", category);
    if (is_active !== "") params.append("is_active", is_active);

    console.log(
      "🔎 Buscando sitios con:",
      Object.fromEntries(params.entries())
    );

    container.innerHTML = `
            <div class="text-center mt-4">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Buscando sitios turísticos...</p>
            </div>`;

    try {
      const res = await fetch(`/api/tourist_sites?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        console.error("❌ Error de red o autorización:", res.status);
        container.innerHTML = `<p class="text-danger text-center mt-3">Error al obtener sitios turísticos.</p>`;
        return;
      }

      const data = await res.json();
      renderSites(data.data || data);
    } catch (error) {
      console.error("❌ Error al buscar sitios:", error);
      container.innerHTML = `<p class="text-danger text-center mt-3">Error de conexión al buscar sitios.</p>`;
    }
  }

  // Eventos

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      searchSites();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") searchSites();
    });
  }

  if (categoryFilter) categoryFilter.addEventListener("change", searchSites);
  if (statusFilter) statusFilter.addEventListener("change", searchSites);

  // Carga inicial
  searchSites();
});
