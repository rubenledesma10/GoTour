document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("tbody");
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    const baseUrl = "/api/touristinfo_recep";

    if (!tbody || role !== "receptionist" || !token) return;

    tbody.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        if (!row) return;
        const id = row.dataset.id;

        // --- ELIMINAR ---
        if (e.target.classList.contains("btnDelete")) {
            if (!confirm("¿Seguro que querés eliminar este turista?")) return;

            try {
                const res = await fetch(`${baseUrl}/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const result = await res.json();

                if (res.ok) {
                    alert(result.message || "Turista eliminado correctamente.");
                    row.classList.add("table-danger");
                    row.querySelector(".btnEdit")?.classList.add("d-none");
                    row.querySelector(".btnDelete")?.classList.add("d-none");

                    const btnReact = document.createElement("button");
                    btnReact.className = "btn btn-sm btn-success btnReactivate";
                    btnReact.textContent = "Reactivar";
                    row.querySelector("td:last-child").appendChild(btnReact);
                } else {
                    alert(result.error || "Error al eliminar.");
                }
            } catch (err) {
                console.error("Error al eliminar:", err);
                alert("Error de conexión al eliminar.");
            }
        }

        // --- REACTIVAR ---
        if (e.target.classList.contains("btnReactivate") || e.target.closest(".btn-reactivate")) {
            if (!confirm("¿Seguro que querés reactivar este turista?")) return;

            try {
                const res = await fetch(`${baseUrl}/${id}/reactivate`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const result = await res.json();

                if (res.ok) {
                    alert(result.message || "Turista reactivado correctamente.");
                    row.classList.remove("table-danger");
                    e.target.remove();

                    const td = row.querySelector("td:last-child");
                    const btnEdit = document.createElement("button");
                    btnEdit.className = "btn btn-sm btn-warning btnEdit";
                    btnEdit.textContent = "Editar";

                    const btnDel = document.createElement("button");
                    btnDel.className = "btn btn-sm btn-danger btnDelete ms-2";
                    btnDel.textContent = "Eliminar";

                    td.appendChild(btnEdit);
                    td.appendChild(btnDel);
                } else {
                    alert(result.error || "Error al reactivar.");
                }
            } catch (err) {
                console.error("Error al reactivar:", err);
                alert("Error de conexión al reactivar.");
            }
        }
    });
});
