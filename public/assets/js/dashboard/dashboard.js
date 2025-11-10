document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab");

  const tabPanels = document.querySelectorAll(".tabcontent");

  const dashBanner = document.querySelector(".dash-banner");

  function switchTab(targetTab) {
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    tabButtons.forEach((btn) => {
      btn.classList.remove("tab--active");
      btn.removeAttribute("aria-current");
    });

    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add("tab--active");
      targetButton.setAttribute("aria-current", "page");
    }

    const panelToShow = document.getElementById(targetTab);
    if (panelToShow) {
      panelToShow.classList.add("active");
    }

    updateBanner(targetTab);

    if (targetTab === "proyectos") {
      window.history.pushState(null, null, "#proyectos");
    } else if (targetTab === "aportes") {
      window.history.pushState(null, null, "#aportes");
    } else if (targetTab === "favoritos") {
      window.history.pushState(null, null, "#favoritos");
    }
  }

  function updateBanner(tabName) {
    if (dashBanner) {
      switch (tabName) {
        case "proyectos":
          dashBanner.textContent = "USUARIO : MIS PROYECTOS";
          break;
        case "aportes":
          dashBanner.textContent = "USUARIO : MIS APORTES";
          break;
        case "favoritos":
          dashBanner.textContent = "USUARIO : FAVORITOS";
          break;
        default:
          dashBanner.textContent = "USUARIO : MIS APORTES";
      }
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  function activateTabFromHash() {
    const hash = window.location.hash.substring(1);

    if (hash === "proyectos" || hash === "mis-proyectos") {
      switchTab("proyectos");
    } else if (hash === "aportes" || hash === "mis-aportes") {
      switchTab("aportes");
    } else if (hash === "favoritos") {
      switchTab("favoritos");
    } else {
      switchTab("aportes");
    }
  }

  activateTabFromHash();

  window.addEventListener("hashchange", activateTabFromHash);

  const donationLinks = document.querySelectorAll(".donation__link");
  donationLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const projectTitle = link
        .getAttribute("aria-label")
        .replace("Ver proyecto ", "");
      console.log(`Navegando al proyecto: ${projectTitle}`);
    });
  });

  const editButtons = document.querySelectorAll(".project .btn--primary");
  editButtons.forEach((button) => {
    if (button.textContent.trim() === "Editar") {
      button.addEventListener("click", () => {
        const projectTitle = button
          .closest(".project")
          .querySelector(".content-container-title h3").textContent;
        console.log(`Editando proyecto: ${projectTitle}`);
      });
    }
  });

  const contributeButtons = document.querySelectorAll(".project .btn--primary");
  contributeButtons.forEach((button) => {
    if (button.textContent.trim() === "Aportar") {
      button.addEventListener("click", () => {
        const projectTitle = button
          .closest(".project")
          .querySelector(".content-container-title h3").textContent;
        console.log(`Aportando al proyecto: ${projectTitle}`);
      });
    }
  });

  const heartButtons = document.querySelectorAll(".project-like-btn");
  heartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const projectTitle = button
        .closest(".project")
        .querySelector(".content-container-title h3").textContent;
      const isLiked = button.getAttribute("data-liked") === "true";

      if (isLiked) {
        button.setAttribute("data-liked", "false");
        button.querySelector(".heart-icon-filled").style.display = "none";
        button.querySelector(".heart-icon-empty").style.display = "block";
        console.log(`Proyecto eliminado de favoritos: ${projectTitle}`);
      } else {
        button.setAttribute("data-liked", "true");
        button.querySelector(".heart-icon-filled").style.display = "block";
        button.querySelector(".heart-icon-empty").style.display = "none";
        console.log(`Proyecto marcado como favorito: ${projectTitle}`);
      }
    });
  });

  const newProjectButton = document.querySelector(".dash-header .btn--primary");
  if (newProjectButton) {
    newProjectButton.addEventListener("click", () => {
      console.log("Creando nuevo proyecto");
    });
  }
});
