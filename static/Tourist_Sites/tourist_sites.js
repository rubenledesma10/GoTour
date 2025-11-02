document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ tourist_sites_view.js cargado correctamente");

    // ============================
    // ✅ Sistema de Toasts Global
    // ============================

    // Contenedor general para toasts (arriba derecha)
    let toastMainContainer = document.getElementById("toastMainContainer");
    if (!toastMainContainer) {
        toastMainContainer = document.createElement("div");
        toastMainContainer.id = "toastMainContainer";
        toastMainContainer.className = "position-fixed top-0 end-0 p-3";
        toastMainContainer.style.zIndex = "9999";
        document.body.appendChild(toastMainContainer);
    }

    // ✅ Toast simple (Aceptar)
    window.showToast = (message, type = "primary") => {
        const toastEl = document.createElement("div");
        toastEl.className = "toast align-items-center border-0 shadow-sm show mb-2";
        toastEl.style.background = "white";
        toastEl.style.borderLeft = "5px solid var(--bs-" + type + ")";
        toastEl.innerHTML = `
            <div class="d-flex align-items-center p-2">
                <div class="toast-body text-black fw-semibold">${message}</div>
                <button class="btn btn-sm btn-primary ms-2">Aceptar</button>
            </div>
        `;

        toastMainContainer.appendChild(toastEl);

        toastEl.querySelector("button").addEventListener("click", () => {
            toastEl.remove();
        });

        setTimeout(() => toastEl.remove(), 4000);
    };

    // ✅ Toast confirmar (Sí / No)
    window.showToastConfirm = (message) => {
        return new Promise((resolve) => {
            const toastEl = document.createElement("div");
            toastEl.className = "toast align-items-center border-0 shadow-sm show mb-2";
            toastEl.style.background = "white";
            toastEl.style.borderLeft = "5px solid var(--bs-primary)";
            toastEl.innerHTML = `
                <div class="d-flex flex-column p-2">
                    <div class="fw-semibold text-black mb-2">${message}</div>
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-primary">Sí</button>
                        <button class="btn btn-sm btn-secondary">No</button>
                    </div>
                </div>
            `;

            toastMainContainer.appendChild(toastEl);

            toastEl.querySelector(".btn-primary").addEventListener("click", () => {
                toastEl.remove();
                resolve(true);
            });

            toastEl.querySelector(".btn-secondary").addEventListener("click", () => {
                toastEl.remove();
                resolve(false);
            });
        });
    };



    // ===========================
    // ✅ Autenticación y roles
    // ===========================

    const body = document.getElementById("protectedBody");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (body) body.style.display = "block";

    if (!token) {
        document.querySelectorAll(".btn-send-comment, .admin-only").forEach(el => el.style.display = "none");
    } else {
        if (role !== "admin") {
            document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
        }
        if (role === "tourist") {
            document.querySelectorAll(".btn-send-comment").forEach(el => el.style.display = "inline-block");
        } else {
            document.querySelectorAll(".btn-send-comment").forEach(el => el.style.display = "none");
        }
    }

    // ============================
    // ✅ Búsqueda & filtros
    // ============================

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const searchBtn = document.getElementById("btnSearch");
    const container = document.querySelector(".row.row-cols-1");

    if (!container) {
        console.error("❌ No se encontró el contenedor principal de sitios");
        return;
    }


    // ============================
    // ✅ Renderizar sitios
    // ============================

    function renderSites(sites) {
        container.innerHTML = "";

        if (!sites || sites.length === 0) {
            container.innerHTML = `<p class="text-center text-muted mt-3">No se encontraron resultados.</p>`;
            return;
        }

        sites.forEach(site => {
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

            let ratingStars = "";
            if (site.average_rating && site.average_rating > 0) {
                const filled = Math.floor(site.average_rating);
                const empty = 5 - filled;

                ratingStars = `<p class="text-muted mb-1">
                    <i class="bi bi-star-fill text-warning"></i> Promedio calificaciones: `;

                ratingStars += `<i class="bi bi-star-fill text-warning"></i>`.repeat(filled);
                ratingStars += `<i class="bi bi-star text-muted"></i>`.repeat(empty);
                ratingStars += ` (${site.average_rating.toFixed(2)})</p>`;
            } else {
                ratingStars = `<p class="text-muted mb-1"><i class="bi bi-star text-muted"></i> Sin calificaciones</p>`;
            }

            let statusBadge = site.is_activate
                ? `<span class="badge bg-success">Activo</span>`
                : `<div class="d-flex align-items-center gap-2">
                        <span class="badge bg-secondary">Inactivo</span>
                        ${
                            role === "admin" && token
                            ? `<button class="btn btn-success btn-sm btn-reactivate" data-id="${site.id_tourist_site}">
                                    <i class="bi bi-arrow-clockwise"></i> Reactivar
                               </button>`
                            : ""
                        }
                   </div>`;

            const commentButton = (role === "tourist" && site.is_activate && token)
                ? `<a href="/api/feedback/add?site_id=${site.id_tourist_site}&name=${encodeURIComponent(site.name)}"
                    class="btn btn-success btn-sm mb-2 btn-send-comment">
                    <i class="bi bi-chat-dots"></i> Comentar
                </a>` : "";

            const card = `
            <div class="col">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${imagePath}"
                        class="card-img-top site-photo"
                        style="height:200px; object-fit:cover; cursor:pointer;"
                        data-bs-toggle="modal"
                        data-bs-target="#imageModal"
                        data-img-src="${imagePath}"
                        data-img-name="${site.name}">
                    <div class="card-body">
                        ${commentButton}
                        <h5 class="card-title text-primary">${site.name}</h5>
                        <p><strong>Descripción:</strong> ${site.description}</p>
                        <p class="text-muted"><i class="bi bi-geo-alt-fill"></i> ${site.address}</p>
                        <p class="text-muted"><i class="bi bi-clock"></i> ${site.opening_hours} - ${site.closing_hours}</p>
                        <p class="text-muted mb-1"><i class="bi bi-bar-chart-line"></i> Promedio visitas: <strong>${site.average?.toFixed(2) || "0.00"}</strong></p>
                        ${ratingStars}
                        <p class="text-muted"><i class="bi bi-tag-fill"></i> ${site.category}</p>
                    </div>
                    <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                        ${site.url ? `<a href="${site.url}" target="_blank" class="btn btn-outline-primary btn-sm"><i class="bi bi-box-arrow-up-right"></i> Ver sitio</a>` : ""}
                        ${statusBadge}
                    </div>
                </div>
            </div>`;

            container.insertAdjacentHTML("beforeend", card);
        });

        document.querySelectorAll(".site-photo").forEach(img => {
            img.addEventListener("click", () => {
                document.getElementById("modalImage").src = img.getAttribute("data-img-src");
                document.getElementById("imageModalLabel").textContent =
                    `Vista ampliada - ${img.getAttribute("data-img-name")}`;
            });
        });
    }


    // ========================================
    // ✅ Reactivar sitio (con confirmación)
    // ========================================

    container.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-reactivate");
        if (!btn) return;

        const id = btn.dataset.id;
        const token = localStorage.getItem("token");

        if (btn.dataset.processing === "true") return;
        btn.dataset.processing = "true";

        const confirmed = await showToastConfirm("¿Deseas reactivar este sitio turístico?");
        if (!confirmed) {
            btn.dataset.processing = "false";
            return;
        }

        try {
            const res = await fetch(`/api/tourist_sites/${id}/reactivate`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok) {
                showToast("✅ Sitio turístico reactivado con éxito", "success");
                searchSites();
            } else {
                showToast("⚠️ " + (data.error || data.message), "danger");
            }
        } catch (err) {
            showToast("❌ Error al intentar reactivar el sitio", "danger");
        } finally {
            btn.dataset.processing = "false";
        }
    });


    // =============================
    // ✅ Buscar sitios con filtros
    // =============================

    async function searchSites() {
        const query = searchInput?.value.trim() || "";
        const category = categoryFilter?.value || "";
        const is_active = statusFilter?.value || "";
        const token = localStorage.getItem("token");

        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (category) params.append("category", category);
        if (is_active !== "") params.append("is_active", is_active);

        container.innerHTML = `
            <div class="text-center mt-4">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Buscando sitios turísticos...</p>
            </div>`;

        try {
            const res = await fetch(`/api/tourist_sites?${params.toString()}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });

            const data = await res.json();
            if (!res.ok) {
                container.innerHTML = `<p class="text-danger text-center mt-3">Error al obtener sitios.</p>`;
                return;
            }

            renderSites(data.data || data);
        } catch {
            container.innerHTML = `<p class="text-danger text-center mt-3">Error de conexión.</p>`;
        }
    }

    // =====================
    // ✅ Eventos
    // =====================

    if (searchBtn) searchBtn.addEventListener("click", searchSites);
    if (searchInput) searchInput.addEventListener("keyup", e => e.key === "Enter" && searchSites());
    if (categoryFilter) categoryFilter.addEventListener("change", searchSites);
    if (statusFilter) statusFilter.addEventListener("change", searchSites);

    // ✅ Carga inicial
    searchSites();
});
