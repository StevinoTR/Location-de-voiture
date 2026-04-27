// Mobile menu functionality - loaded as regular script for global access

function toggleMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  }
}

function closeMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Dashboard sidebar toggle
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');
  
  if (mobileMenu && hamburger) {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target) && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  }
  
  // Close sidebar when clicking outside on mobile
  if (sidebar && window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
    const hamburgerBtn = document.getElementById('hamburger');
    if (!sidebar.contains(e.target) && (!hamburgerBtn || !hamburgerBtn.contains(e.target))) {
      sidebar.classList.remove('open');
    }
  }
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu();
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
});
