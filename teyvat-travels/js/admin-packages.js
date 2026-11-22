/* Tour packages page (admin-packages.html): lists the catalog and filters it by search text,
   nation and status. Every row links to the Edit package page. */
(function () {
  "use strict";

  const data = window.TTAdmin.data;
  const el = window.TTAdmin.ui.el;

  const body = document.getElementById("pk-body");
  const searchInput = document.getElementById("pk-search");
  const nationSelect = document.getElementById("pk-nation");
  const statusSelect = document.getElementById("pk-status");
  const countLabel = document.getElementById("pk-count");
  const footNote = document.getElementById("pk-foot");
  const emptyBox = document.getElementById("pk-empty");
  const table = document.getElementById("pk-table");
  if (!body || !searchInput || !nationSelect || !statusSelect) {
    return;
  }

  const packages = data.getPackages();

  /* Fills the nation filter with the seven nations after "All nations". */
  function fillNations() {
    data.NATIONS.forEach(function (nation) {
      const option = el("option", "", nation);
      option.value = nation;
      nationSelect.appendChild(option);
    });
  }

  /* Returns the packages that match the three filters. */
  function getVisible() {
    const text = searchInput.value.trim().toLowerCase();
    const nation = nationSelect.value;
    const status = statusSelect.value;

    return packages.filter(function (pkg) {
      const matchesText = !text ||
        (pkg.package_name + " " + pkg.package_code).toLowerCase().indexOf(text) !== -1;
      const matchesNation = nation === "all" || pkg.nation === nation;
      const matchesStatus = status === "all" || pkg.status === status;
      return matchesText && matchesNation && matchesStatus;
    });
  }

  /* Builds one table row. All values are set with textContent. */
  function buildRow(pkg) {
    const row = document.createElement("tr");
    const editUrl = "admin-package-edit.html?code=" + encodeURIComponent(pkg.package_code);

    const first = el("td", "ad-td-main");
    const wrap = el("div", "ad-pkg");
    const image = el("img", "ad-pkg__thumb");
    image.src = data.IMAGES[pkg.nation] || "";
    image.alt = "";
    image.width = 56;
    image.height = 38;
    image.loading = "lazy";
    wrap.appendChild(image);
    const names = el("div");
    names.style.minWidth = "0";
    const nameLink = el("a", "ad-pkg__name", pkg.package_name);
    nameLink.href = editUrl;
    names.appendChild(nameLink);
    names.appendChild(el("p", "ad-pkg__code", pkg.package_code));
    wrap.appendChild(names);
    first.appendChild(wrap);
    row.appendChild(first);

    const nation = el("td", "", pkg.nation);
    nation.dataset.label = "Nation";
    row.appendChild(nation);

    const price = el("td");
    price.dataset.label = "Base price";
    const priceBox = el("div");
    priceBox.appendChild(el("p", "ad-cell-strong", data.formatPeso(pkg.base_price)));
    priceBox.appendChild(el("p", "ad-cell-sub", "per person"));
    price.appendChild(priceBox);
    row.appendChild(price);

    const duration = el("td", "ad-cell-small", pkg.duration_days + " Days / " + pkg.duration_nights + " Nights");
    duration.dataset.label = "Duration";
    row.appendChild(duration);

    const max = el("td", "ad-cell-strong", pkg.max_group_size + " guests");
    max.dataset.label = "Max group";
    row.appendChild(max);

    const status = el("td");
    status.dataset.label = "Status";
    status.appendChild(el("span", "ad-pill" + (pkg.status === "Active" ? "" : " ad-pill--off"), pkg.status));
    row.appendChild(status);

    const action = el("td");
    action.dataset.label = "Action";
    const link = el("a", "ad-link");
    link.href = editUrl;
    link.setAttribute("aria-label", "Edit " + pkg.package_name);
    link.innerHTML = '<svg class="ad-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4"/></svg>';
    link.appendChild(document.createTextNode("Edit"));
    action.appendChild(link);
    row.appendChild(action);

    return row;
  }

  /* Redraws the table, the count and the footer note. */
  function render() {
    const visible = getVisible();

    body.textContent = "";
    visible.forEach(function (pkg) {
      body.appendChild(buildRow(pkg));
    });

    table.hidden = visible.length === 0;
    emptyBox.hidden = visible.length !== 0;
    countLabel.textContent = visible.length + (visible.length === 1 ? " package" : " packages");

    const active = packages.filter(function (pkg) {
      return pkg.status === "Active";
    });
    const nationsCovered = new Set(active.map(function (pkg) {
      return pkg.nation;
    })).size;
    footNote.textContent = active.length + " active " + (active.length === 1 ? "package" : "packages") +
      " · " + (nationsCovered === 7 ? "All seven nations covered" : nationsCovered + " of 7 nations covered") +
      " · Capacity values are demo settings";
  }

  fillNations();
  searchInput.addEventListener("input", render);
  nationSelect.addEventListener("change", render);
  statusSelect.addEventListener("change", render);
  render();
})();
