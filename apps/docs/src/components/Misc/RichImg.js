document.addEventListener("DOMContentLoaded", function() {
  const body = document.body;
  const imageContainers = document.querySelectorAll(".image-container img");
  const modals = document.querySelectorAll(".modal");

  imageContainers.forEach((imageContainer, index) => {
    imageContainer.addEventListener("click", (event) => {
      body.style.overflow = "hidden"; // Disable scrolling on the body

      modals[index].classList.add("active");
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modals.forEach((modal) => {
        if (modal.classList.contains("active")) {
          closeModal(modal);
        }
      });
    }
  });

  function closeModal(modal) {
    modal.classList.remove("active");
    body.style.overflow = ""; // Re-enable scrolling on the body
  }
});