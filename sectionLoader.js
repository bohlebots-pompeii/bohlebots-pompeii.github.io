const SECTION_CONFIG = {
    '_lightweight': {
        Introduction: ['Introduction.md'],
        Mechanical: [],
        Electronics: [],
        Software: ['DoesntExist.md']
    }
};

// url helper
function getParam(key, fallback) {
    return new URLSearchParams(window.location.search).get(key) || fallback;
}
function getCurrentFolder() {
    let md = getParam('md', '_lightweight/Introduction.md');
    let folder = md.split('/')[0];
    if (!folder || !(folder in SECTION_CONFIG)) {
        // fallback to first available folder
        folder = Object.keys(SECTION_CONFIG)[0];
    }
    return folder;
}
function getCurrentFile() {
    let md = getParam('md', '_lightweight/Introduction.md');
    let file = md.split('/')[1];
    if (!file) file = Object.values(SECTION_CONFIG[getCurrentFolder()])[0][0];
    return file;
}

function stripFrontMatter(text) {
    return text.replace(/^---[\s\S]*?---\s*/, '');
}

function renderSidebar(folder) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        console.error('Sidebar element not found!');
        return;
    }
    sidebar.innerHTML = '';
    console.log('Rendering sidebar for folder:', folder);

    const title = document.createElement('div');
    title.className = 'sidebar-section-title';
    title.textContent = folder.replace(/^_/, '').replace(/-/g, ' ');
    sidebar.appendChild(title);

    const config = SECTION_CONFIG[folder];
    console.log('Loaded config for folder:', folder, config);
    if (!config) {
        console.warn('No config found for folder:', folder);
        return;
    }

    const currentFile = getCurrentFile();
    console.log('Current file for sidebar:', currentFile);

    Object.entries(config).forEach(([groupName, files]) => {
        console.log('Sidebar group:', groupName, files);
        const group = document.createElement('div');
        group.className = 'sidebar-group open';

        const label = document.createElement('div');
        label.className = 'sidebar-group-label';
        label.textContent = groupName;

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
        // update URL without reloading
        history.replaceState(null, '', `?md=${folder}/${file}`);
    });
    li.appendChild(a);
    return li;
}

function renderMarkdown(folder, file, triedFallback = false) {
    console.log('Loading markdown:', folder, file);
    let fetchPath = `${folder}/${file}`;
    // If fallback to 404.md, use root 404.md
    if (file === '404.md') {
        fetchPath = '404.md';
    }
    fetch(fetchPath)
        .then(res => {
            if (!res.ok) throw new Error('File not found');
            return res.text();
        })
        .then(md => {
            console.log('Loaded markdown for', file, 'length:', md.length);
            document.getElementById('markdown-content').innerHTML =
                `<div class="section-content">${marked.parse(stripFrontMatter(md))}</div>`;
        })
        .catch((err) => {
            console.warn('Markdown load failed for', file, err);
            if (!triedFallback && file !== '404.md') {
                renderMarkdown(folder, '404.md', true);
            } else {
                document.getElementById('markdown-content').innerHTML =
                    `<p style="color:#999;padding:40px">Could not load content.</p>`;
            }
        });
}

if (window.location.pathname.endsWith('section.html')) {
    window.addEventListener('DOMContentLoaded', () => {
        let folder = getCurrentFolder();
        console.log('section.html loaded, folder:', folder);
        renderSidebar(folder);
        const config = SECTION_CONFIG[folder];
        let file = getParam('md', null);
        let isInitial = false;
        if (!file && config) {
            // load first document
            const firstGroup = Object.values(config)[0];
            if (Array.isArray(firstGroup) && firstGroup.length > 0) {
                file = `${folder}/${firstGroup[0]}`;
                isInitial = true;
            }
        }
        // If file is just a group (no file), default to Introduction.md
        if (!file || file.indexOf('/') === -1) {
            file = '_lightweight/Introduction.md';
        }
        if (file) {
            const parts = file.split('/');
            renderMarkdown(parts[0], parts[1]);
            // toggle sidebar link for visual
            setTimeout(() => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    const links = sidebar.querySelectorAll('a');
                    links.forEach(el => el.classList.remove('active'));
                    if (isInitial && links.length > 0) {
                        links[0].classList.add('active');
                    } else {
                        // mark active link based on URL
                        links.forEach(link => {
                            if (link.href && link.href.includes(parts[1])) {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            }, 50);
        } else {
            renderMarkdown(folder, '404.md');
        }
    });
}
