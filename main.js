document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('section.html')) {
        setupSidebarToggle();
    }
});


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



