document.addEventListener('DOMContentLoaded', function () {
    buildNavMenu();

    if (window.location.pathname.endsWith('section.html')) {
        setupSidebarToggle();
        toggleHeaderHamburgerOrHome();
        window.addEventListener('resize', toggleHeaderHamburgerOrHome);
    }
});

function buildNavMenu() {
    const folders = ['_lightweight'];
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    navMenu.innerHTML = '<li><a href="index.html" class="nav-link">Home</a></li>';
    folders.forEach(folder => {
        const folderName = folder.replace(/^_/, '');
        const li = document.createElement('li');
        li.innerHTML = `<a href="section.html?section=${encodeURIComponent(folder)}" class="nav-link">${folderName.charAt(0).toUpperCase() + folderName.slice(1)}</a>`;
        navMenu.appendChild(li);
    });
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-open');
        toggle.classList.toggle('active');
    });

    document.addEventListener('click', e => {
        if (window.innerWidth <= 900 && sidebar.classList.contains('sidebar-open')) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('sidebar-open');
                toggle.classList.remove('active');
            }
        }
    });
}

function toggleHeaderHamburgerOrHome() {
    const hamburger = document.getElementById('header-hamburger');
    const homeBtn = document.getElementById('home-btn-mobile');
    if (!hamburger || !homeBtn) return;
    if (window.innerWidth <= 900) {
        hamburger.style.display = 'none';
        homeBtn.style.display = 'flex';
    } else {
        hamburger.style.display = '';
        homeBtn.style.display = 'none';
    }
}

