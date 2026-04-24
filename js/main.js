document.addEventListener("DOMContentLoaded", () => {
  class MobileMenu {
    constructor(toggleSelector, menuSelector) {
      this.toggle = document.querySelector(toggleSelector);
      this.menu = document.querySelector(menuSelector);
      if (!this.toggle || !this.menu) return;
      this.menuLinks = this.menu.querySelectorAll("a");
      this.init();
    }

    init() {
      this.toggle.addEventListener("click", () => this.toggleMenu());
      this.menuLinks.forEach((link) => link.addEventListener("click", () => this.closeMenu()));
      document.addEventListener("click", (event) => this.handleDocumentClick(event));
      document.addEventListener("keydown", (event) => this.handleKeydown(event));
    }

    toggleMenu() {
      const isOpen = this.menu.classList.toggle("open");
      this.toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    closeMenu() {
      this.menu.classList.remove("open");
      this.toggle.setAttribute("aria-expanded", "false");
    }

    handleDocumentClick(event) {
      const clickedInsideMenu = this.menu.contains(event.target);
      const clickedToggle = this.toggle.contains(event.target);
      if (!clickedInsideMenu && !clickedToggle && this.menu.classList.contains("open")) {
        this.closeMenu();
      }
    }

    handleKeydown(event) {
      if (event.key === "Escape") this.closeMenu();
    }
  }

  class GalleryModal {
    constructor() {
      this.modal = document.querySelector("#imageModal");
      this.modalImage = document.querySelector("#modalImage");
      this.closeButton = document.querySelector(".modal-close");
      this.prevButton = document.querySelector(".modal-prev");
      this.nextButton = document.querySelector(".modal-next");
      this.galleryImages = Array.from(document.querySelectorAll("[data-modal-image]"));
      if (!this.modal || !this.modalImage || !this.closeButton || this.galleryImages.length === 0) return;
      this.currentIndex = 0;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.init();
    }

    init() {
      this.galleryImages.forEach((image, index) => {
        image.addEventListener("click", () => this.openModal(index));
      });
      this.closeButton.addEventListener("click", () => this.closeModal());
      if (this.prevButton) this.prevButton.addEventListener("click", (event) => { event.stopPropagation(); this.showPrevious(); });
      if (this.nextButton) this.nextButton.addEventListener("click", (event) => { event.stopPropagation(); this.showNext(); });
      this.modal.addEventListener("click", (event) => {
        if (event.target === this.modal) this.closeModal();
      });
      document.addEventListener("keydown", (event) => this.handleKeydown(event));
      this.modal.addEventListener("touchstart", (event) => {
        this.touchStartX = event.changedTouches[0].screenX;
      });
      this.modal.addEventListener("touchend", (event) => {
        this.touchEndX = event.changedTouches[0].screenX;
        this.handleSwipe();
      });
    }

    openModal(index) {
      this.currentIndex = index;
      this.updateModalImage();
      this.modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    closeModal() {
      this.modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    updateModalImage() {
      const activeImage = this.galleryImages[this.currentIndex];
      if (!activeImage) return;
      this.modalImage.src = activeImage.dataset.modalImage || activeImage.getAttribute("src");
      this.modalImage.alt = activeImage.dataset.modalAlt || activeImage.getAttribute("alt") || "Expanded image";
    }

    showNext() {
      this.currentIndex = (this.currentIndex + 1) % this.galleryImages.length;
      this.updateModalImage();
    }

    showPrevious() {
      this.currentIndex = (this.currentIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
      this.updateModalImage();
    }

    handleKeydown(event) {
      if (!this.modal.classList.contains("open")) return;
      if (event.key === "Escape") this.closeModal();
      if (event.key === "ArrowRight") this.showNext();
      if (event.key === "ArrowLeft") this.showPrevious();
    }

    handleSwipe() {
      const swipeDistance = this.touchEndX - this.touchStartX;
      if (Math.abs(swipeDistance) < 50) return;
      swipeDistance < 0 ? this.showNext() : this.showPrevious();
    }
  }

  class ContactFormManager {
    constructor(formSelector, messageSelector) {
      this.form = document.querySelector(formSelector);
      this.messageBox = document.querySelector(messageSelector);
      if (!this.form || !this.messageBox) return;
      this.firstNameInput = this.form.querySelector("#firstName");
      this.lastNameInput = this.form.querySelector("#lastName");
      this.emailInput = this.form.querySelector("#email");
      this.messageInput = this.form.querySelector("#message");
      this.storageKey = "nadija-contact-draft";
      this.init();
    }

    init() {
      this.restoreDraft();
      this.attachInputListeners();
      this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    }

    attachInputListeners() {
      [this.firstNameInput, this.lastNameInput, this.emailInput, this.messageInput].forEach((input) => {
        if (input) input.addEventListener("input", () => this.saveDraft());
      });
    }

    saveDraft() {
      const draft = {
        firstName: this.firstNameInput?.value.trim() || "",
        lastName: this.lastNameInput?.value.trim() || "",
        email: this.emailInput?.value.trim() || "",
        message: this.messageInput?.value.trim() || ""
      };
      localStorage.setItem(this.storageKey, JSON.stringify(draft));
    }

    restoreDraft() {
      const savedDraft = localStorage.getItem(this.storageKey);
      if (!savedDraft) return;
      const draft = JSON.parse(savedDraft);
      if (this.firstNameInput) this.firstNameInput.value = draft.firstName || "";
      if (this.lastNameInput) this.lastNameInput.value = draft.lastName || "";
      if (this.emailInput) this.emailInput.value = draft.email || "";
      if (this.messageInput) this.messageInput.value = draft.message || "";
    }

    clearDraft() {
      localStorage.removeItem(this.storageKey);
    }

    setMessage(text, isError = false) {
      this.messageBox.textContent = text;
      this.messageBox.style.color = isError ? "#991313" : "#2f5f3a";
    }

    validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    handleSubmit(event) {
      event.preventDefault();
      const firstName = this.firstNameInput?.value.trim() || "";
      const lastName = this.lastNameInput?.value.trim() || "";
      const email = this.emailInput?.value.trim() || "";
      const message = this.messageInput?.value.trim() || "";
      if (!firstName || !lastName || !email || !message) {
        this.setMessage("Please fill out all fields before submitting.", true);
        return;
      }
      if (!this.validateEmail(email)) {
        this.setMessage("Please enter a valid email address.", true);
        return;
      }
      if (message.length < 10) {
        this.setMessage("Please enter a longer message so I know how to help.", true);
        return;
      }
      this.setMessage("Message sent.");
      this.form.reset();
      this.clearDraft();
    }
  }

  new MobileMenu(".menu-toggle", ".mobile-menu");
  new GalleryModal();
  new ContactFormManager("#contactForm", "#formMessage");
});
