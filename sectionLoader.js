const SECTION_CONFIG = {
    '_lightweight': ['Introduction.md', 'Header.md']
};

function getCurrentFolder() {
    const md = new URLSearchParams(window.location.search).get('md') || '_lightweight/Introduction.md';
    const parts = md.split('/');
    return parts[0];
}

function getCurrentFile() {
    const md = new URLSearchParams(window.location.search).get('md') || '_lightweight/Introduction.md';
    const parts = md.split('/');
    return parts[1];
}

function renderSidebar(folder) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    const title = document.createElement('h1');
    title.textContent = folder.replace(/^_/, ''); // Nur Ordnername, kein .md
    sidebar.appendChild(title);
    const ul = document.createElement('ul');
    (SECTION_CONFIG[folder] || []).forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = file.replace('.md','');
        a.href = `section.html?md=${folder}/${file}`;
        if (file === getCurrentFile()) a.classList.add('active');
        a.onclick = function(e) {
            e.preventDefault();
            renderMarkdown(folder, file);
            document.querySelectorAll('.markdown-sidebar a').forEach(el => el.classList.remove('active'));
            a.classList.add('active');
        };
        li.appendChild(a);
        ul.appendChild(li);
    });
    sidebar.appendChild(ul);
    // Header-Brand anpassen
    const brand = document.querySelector('.brand-main');
    if (brand) brand.textContent = folder.replace(/^_/, '');
}

function renderMarkdown(folder, file) {
    fetch(`${folder}/${file}`)
        .then(res => res.text())
        .then(md => {
            document.getElementById('markdown-content').innerHTML = `<h2 class="section-title">${file.replace('.md','')}</h2><div class="section-content">${marked.parse(md)}</div>`;
        });
}

if (window.location.pathname.endsWith('section.html')) {
    window.addEventListener('DOMContentLoaded', () => {
        const folder = getCurrentFolder();
        const file = getCurrentFile();
        renderSidebar(folder);
        renderMarkdown(folder, file);
    });
}
