document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const donorCards = document.querySelectorAll(".donor-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      this.classList.add("active");

      const filter = this.getAttribute("data-filter");

      filterDonors(filter);
    });
  });

  function filterDonors(filter) {
    donorCards.forEach((card) => {
      const amount = card.getAttribute("data-amount");

      if (filter === "all") {
        card.classList.remove("hidden");
        animateCard(card);
      } else if (filter === amount) {
        card.classList.remove("hidden");
        animateCard(card);
      } else {
        card.classList.add("hidden");
      }
    });
  }

  function animateCard(card) {
    card.style.animation = "none";
    card.offsetHeight;
    card.style.animation = "fadeInUp 0.5s ease-out";
  }

  const sortButton = document.createElement("button");
  sortButton.textContent = "Ordenar por cantidad";
  sortButton.className = "btn btn--ghost";
  sortButton.style.marginLeft = "auto";

  const filtersContainer = document.querySelector(".donors-filters");
  if (filtersContainer) {
    filtersContainer.appendChild(sortButton);
  }

  let sortOrder = "desc";

  sortButton.addEventListener("click", function () {
    const donorsList = document.querySelector(".donors-list");
    const cards = Array.from(donorCards).filter(
      (card) => !card.classList.contains("hidden")
    );

    cards.sort((a, b) => {
      const amountA = parseInt(
        a.querySelector(".donor-amount").textContent.replace(/[^\d]/g, "")
      );
      const amountB = parseInt(
        b.querySelector(".donor-amount").textContent.replace(/[^\d]/g, "")
      );

      return sortOrder === "desc" ? amountB - amountA : amountA - amountB;
    });

    cards.forEach((card) => {
      donorsList.appendChild(card);
      animateCard(card);
    });

    sortOrder = sortOrder === "desc" ? "asc" : "desc";
    sortButton.textContent =
      sortOrder === "desc"
        ? "Ordenar por cantidad (↓)"
        : "Ordenar por cantidad (↑)";
  });

  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";
  searchContainer.style.marginBottom = "var(--spacing-6)";
  searchContainer.style.textAlign = "center";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Buscar donadores por nombre...";
  searchInput.className = "search-input";
  searchInput.style.cssText = `
    width: 100%;
    max-width: 400px;
    padding: var(--spacing-3) var(--spacing-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-button);
    font-size: var(--text-base);
    font-family: var(--font-family-primary);
  `;

  searchContainer.appendChild(searchInput);

  const filtersSection = document
    .querySelector(".donors-filters")
    .closest(".card");
  if (filtersSection) {
    filtersSection.parentNode.insertBefore(searchContainer, filtersSection);
  }

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    donorCards.forEach((card) => {
      const donorName = card
        .querySelector(".donor-name")
        .textContent.toLowerCase();
      const donorMessage = card.querySelector(".donor-message");
      const messageText = donorMessage
        ? donorMessage.textContent.toLowerCase()
        : "";

      if (donorName.includes(searchTerm) || messageText.includes(searchTerm)) {
        card.classList.remove("hidden");
        animateCard(card);
      } else {
        card.classList.add("hidden");
      }
    });

    const activeFilter = document.querySelector(".filter-btn.active");
    if (activeFilter && activeFilter.getAttribute("data-filter") !== "all") {
      filterDonors(activeFilter.getAttribute("data-filter"));
    }
  });

  function updateStats() {
    const visibleCards = Array.from(donorCards).filter(
      (card) => !card.classList.contains("hidden")
    );
    const totalDonors = visibleCards.length;
    const totalAmount = visibleCards.reduce((sum, card) => {
      const amount = parseInt(
        card.querySelector(".donor-amount").textContent.replace(/[^\d]/g, "")
      );
      return sum + amount;
    }, 0);
    const averageAmount =
      totalDonors > 0 ? Math.round(totalAmount / totalDonors) : 0;

    const statValues = document.querySelectorAll(".stat__val");
    if (statValues.length >= 3) {
      statValues[0].textContent = totalDonors;
      statValues[1].textContent = `${totalAmount.toLocaleString(
        "es-ES"
      )}&nbsp;€`;
      statValues[2].textContent = `${averageAmount.toLocaleString(
        "es-ES"
      )}&nbsp;€`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", updateStats);
  });

  searchInput.addEventListener("input", updateStats);

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.5s ease-out";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  donorCards.forEach((card) => {
    observer.observe(card);
  });

  const shareButton = document.createElement("button");
  shareButton.innerHTML = `
    <iconify-icon icon="ic:round-share" class="icon"></iconify-icon>
    <span>Compartir donadores</span>
  `;
  shareButton.className = "btn btn--ghost";
  shareButton.style.marginLeft = "var(--spacing-3)";

  if (filtersContainer) {
    filtersContainer.appendChild(shareButton);
  }

  shareButton.addEventListener("click", async function () {
    const visibleCards = Array.from(donorCards).filter(
      (card) => !card.classList.contains("hidden")
    );
    const topDonors = visibleCards.slice(0, 3);

    let shareText = "¡Mira los increíbles donadores de este proyecto!\n\n";
    topDonors.forEach((card, index) => {
      const name = card.querySelector(".donor-name").textContent;
      const amount = card.querySelector(".donor-amount").textContent;
      shareText += `${index + 1}. ${name} - ${amount}\n`;
    });

    shareText += "\n¡Únete a esta increíble comunidad de apoyo!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Donadores del Proyecto",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error al compartir:", err);
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  });

  function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    showNotification("¡Información copiada al portapapeles!");
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-primary);
      color: var(--text-white);
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: var(--radius-button);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: fadeInUp 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "fadeOutDown 0.3s ease-out";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }
  `;
  document.head.appendChild(style);
});
