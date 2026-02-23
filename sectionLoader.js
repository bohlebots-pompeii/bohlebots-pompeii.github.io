const SECTION_CONFIG = {
    '_lightweight': {
        Introduction: ['Introduction.md'],
        Mechanical: [],
        Electronics: [],
        Software: []
    }
};

// ── URL helpers ──────────────────────────────────────────────
function getParam(key, fallback) {
    return new URLSearchParams(window.location.search).get(key) || fallback;
}
function getCurrentFolder() {
    const md = getParam('md', '_lightweight/fallback.md');
    return md.split('/')[0];
}
function getCurrentFile() {
    const md = getParam('md', '_lightweight/fallback.md');
    return md.split('/')[1];
}

// ── Sidebar renderer ─────────────────────────────────────────
function renderSidebar(folder) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';

    // Section title
    const title = document.createElement('div');
    title.className = 'sidebar-section-title';
    title.textContent = folder.replace(/^_/, '').replace(/-/g, ' ');
    sidebar.appendChild(title);

    const config = SECTION_CONFIG[folder];
    if (!config) return;

    const currentFile = getCurrentFile();

    // Flat array → simple list
    if (Array.isArray(config)) {
        const ul = document.createElement('ul');
        config.forEach(file => {
            ul.appendChild(makeArticleItem(folder, file, currentFile));
        });
        sidebar.appendChild(ul);
        return;
    }

    // Object → subsection groups
    Object.entries(config).forEach(([groupName, files]) => {
        const isActive = files.includes(currentFile);

        const group = document.createElement('div');
        group.className = 'sidebar-group' + (isActive ? ' open' : '');

        const label = document.createElement('div');
        label.className = 'sidebar-group-label';
        label.textContent = groupName;
        label.addEventListener('click', () => group.classList.toggle('open'));

        const ul = document.createElement('ul');
        files.forEach(file => {
            ul.appendChild(makeArticleItem(folder, file, currentFile));
        });

        group.appendChild(label);
        group.appendChild(ul);
        sidebar.appendChild(group);
    });
}

function makeArticleItem(folder, file, currentFile) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = file.replace('.md', '').replace(/-/g, ' ');
    a.href = `section.html?md=${folder}/${file}`;
    if (file === currentFile) a.classList.add('active');
    a.addEventListener('click', e => {
        e.preventDefault();
        renderMarkdown(folder, file);
        document.querySelectorAll('.markdown-sidebar a').forEach(el => el.classList.remove('active'));
        a.classList.add('active');
        // keep parent group open
        const group = a.closest('.sidebar-group');
        if (group) group.classList.add('open');
        // update URL without reload
        history.replaceState(null, '', `?md=${folder}/${file}`);
    });
    li.appendChild(a);
    return li;
}

// ── Markdown renderer ────────────────────────────────────────
function renderMarkdown(folder, file, triedFallback = false) {
    fetch(`${folder}/${file}`)
        .then(res => {
            if (!res.ok) throw new Error('File not found');
            return res.text();
        })
        .then(md => {
            document.getElementById('markdown-content').innerHTML =
                `<div class="section-content">${marked.parse(md)}</div>`;
        })
        .catch(() => {
            if (!triedFallback && file !== 'fallback.md') {
                renderMarkdown(folder, 'fallback.md', true);
            } else {
                document.getElementById('markdown-content').innerHTML =
                    `<p style="color:#999;padding:40px">Could not load <strong>${file}</strong>.</p>`;
            }
        });
}

// ── Init ─────────────────────────────────────────────────────
if (window.location.pathname.endsWith('section.html')) {
    window.addEventListener('DOMContentLoaded', () => {
        const folder = getCurrentFolder();
        const file   = getCurrentFile();
        renderSidebar(folder);
        renderMarkdown(folder, file);
    });
}
