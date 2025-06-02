document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const currentYear = new Date().getFullYear();
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = currentYear;
    }

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('nav.main-nav');

    if (mobileMenuButton && mobileMenu && mainNav) {
        mobileMenuButton.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isHidden);
            if (!isHidden) {
                mobileMenuButton.innerHTML = '<i data-lucide="x" class="w-7 h-7"></i>';
            } else {
                mobileMenuButton.innerHTML = '<i data-lucide="menu" class="w-7 h-7"></i>';
            }
            lucide.createIcons(); 
        });

        const desktopNavItems = mainNav.querySelectorAll('.relative.group');
        let mobileMenuHTML = '';

        desktopNavItems.forEach(item => {
            const button = item.querySelector('.nav-item');
            const dropdown = item.querySelector('.nav-dropdown');
            const title = button.firstChild.textContent.trim();
            
            if (dropdown) {
                mobileMenuHTML += `<div class="border-b border-brand-secondary/20">`;
                mobileMenuHTML += `  <button class="mobile-menu-dropdown-toggle w-full flex justify-between items-center px-4 py-3 text-left hover:bg-brand-secondary focus:outline-none">`;
                mobileMenuHTML += `    <span>${title}</span>`;
                mobileMenuHTML += `    <i data-lucide="chevron-down" class="icon-sm"></i>`;
                mobileMenuHTML += `  </button>`;
                mobileMenuHTML += `  <div class="mobile-submenu hidden bg-brand-primary/50 py-1">`;
                dropdown.querySelectorAll('a, span.nav-dropdown-header').forEach(linkOrHeader => {
                    if (linkOrHeader.tagName === 'A') {
                         mobileMenuHTML += `    <a href="${linkOrHeader.getAttribute('href')}" class="block px-4 py-2 hover:bg-brand-secondary/80 rounded transition-colors duration-300 text-sm">${linkOrHeader.textContent}</a>`;
                    } else if (linkOrHeader.classList.contains('nav-dropdown-header')) {
                        mobileMenuHTML += `    <span class="block px-4 py-2 text-xs font-semibold uppercase text-brand-accent/70">${linkOrHeader.textContent}</span>`;
                    }
                });
                mobileMenuHTML += `  </div>`;
                mobileMenuHTML += `</div>`;
            } else { 
                mobileMenuHTML += `<a href="${button.parentElement.querySelector('a') ? button.parentElement.querySelector('a').getAttribute('href') : '#'}" class="mobile-menu-item block px-4 py-3 hover:bg-brand-secondary">${title}</a>`;
            }
        });
        mobileMenu.innerHTML = mobileMenuHTML;
        lucide.createIcons(); 

        document.querySelectorAll('.mobile-menu-dropdown-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const submenu = button.nextElementSibling;
                const icon = button.querySelector('.icon-sm');
                submenu.classList.toggle('hidden');
                button.classList.toggle('open'); 

                 if (submenu.classList.contains('hidden')) {
                    icon.classList.remove('rotate-180');
                } else {
                    icon.classList.add('rotate-180');
                }
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#") { 
                 e.preventDefault();
                 return;
            }
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                     mobileMenuButton.innerHTML = '<i data-lucide="menu" class="w-7 h-7"></i>'; 
                     lucide.createIcons();
                }
            }
        });
    });

    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResultsDisplay = document.getElementById('searchResultsDisplay');
    const searchResultsMessage = document.getElementById('searchResultsMessage');
    const searchableContentRoot = document.getElementById('searchable-content');
    const headerElement = document.querySelector('header');

    let searchableItems = [];
    let itemCounter = 0;

    function collectSearchableData() {
        if (!searchableContentRoot) return;
        const elements = searchableContentRoot.querySelectorAll('p, li, td, h1, h2, h3, h4');
        itemCounter = 0;
        searchableItems = Array.from(elements).map((el, index) => {
            if (!el.id) {
                el.id = `search-target-${itemCounter++}`;
            }
            
            let context = [];
            let parent = el.closest('section');
            if (parent) {
                const sectionH2 = parent.querySelector('h2');
                if (sectionH2) context.push(sectionH2.textContent.trim());
            }
            if (el.tagName.startsWith('H')) {
                 context.push(el.textContent.trim());
            } else {
                let closestHeading = el.closest('div, section')?.querySelector('h3, h4');
                 if (!closestHeading && parent) closestHeading = parent.querySelector('h3');
                 if (closestHeading) context.push(closestHeading.textContent.trim());
            }
            
            return {
                id: el.id,
                text: el.textContent.trim(),
                element: el,
                context: context.filter(Boolean).join(' > ') || document.title 
            };
        }).filter(item => item.text.length > 0);
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function (match) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
        });
    }

    function highlightKeywords(text, query) {
        if (!query) return escapeHTML(text);
        const regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
        return escapeHTML(text).replace(regex, '<mark class="search-highlight">$1</mark>');
    }
    
    function performSearch(query) {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return searchableItems.filter(item => {
            return item.text.toLowerCase().includes(lowerQuery) || item.context.toLowerCase().includes(lowerQuery);
        });
    }

    function displayResults(results, query) {
        searchResultsDisplay.innerHTML = ''; 
        if (results.length === 0) {
            searchResultsMessage.textContent = `"${escapeHTML(query)}"에 대한 검색 결과가 없습니다.`;
            searchResultsDisplay.appendChild(searchResultsMessage);
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'divide-y divide-neutral-medium';

        results.forEach(item => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-neutral-medium/50 cursor-pointer transition-colors duration-150';
            
            const contextDiv = document.createElement('div');
            contextDiv.className = 'text-xs text-brand-secondary font-medium mb-1';
            contextDiv.innerHTML = highlightKeywords(item.context, query);
            
            const snippetLength = 120;
            let snippetText = item.text;
            const matchIndex = item.text.toLowerCase().indexOf(query.toLowerCase());

            if (item.text.length > snippetLength) {
                let startIndex = Math.max(0, matchIndex - snippetLength / 2);
                let endIndex = Math.min(item.text.length, startIndex + snippetLength);
                if (endIndex - startIndex < snippetLength && startIndex > 0) {
                    startIndex = Math.max(0, endIndex - snippetLength);
                }
                snippetText = item.text.substring(startIndex, endIndex);
                if (startIndex > 0) snippetText = "…" + snippetText;
                if (endIndex < item.text.length) snippetText = snippetText + "…";
            }
            
            const textDiv = document.createElement('div');
            textDiv.className = 'text-sm text-neutral-dark';
            textDiv.innerHTML = highlightKeywords(snippetText, query);

            li.appendChild(contextDiv);
            li.appendChild(textDiv);
            
            li.addEventListener('click', () => {
                item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                searchResultsContainer.classList.add('hidden');
                searchInput.value = ''; 
            });
            ul.appendChild(li);
        });
        searchResultsDisplay.appendChild(ul);
    }
    
    function setSearchResultsPosition() {
        if (headerElement && searchResultsContainer) {
            searchResultsContainer.style.top = `${headerElement.offsetHeight}px`;
        }
    }

    if (searchInput && searchResultsContainer && searchableContentRoot) {
        collectSearchableData();
        setSearchResultsPosition();
        window.addEventListener('resize', setSearchResultsPosition);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 1) {
                const results = performSearch(query);
                displayResults(results, query);
                searchResultsContainer.classList.remove('hidden');
            } else {
                searchResultsContainer.classList.add('hidden');
                searchResultsDisplay.innerHTML = '';
                searchResultsMessage.textContent = '검색어를 입력하여 페이지 내 콘텐츠를 찾아보세요.';
                searchResultsDisplay.appendChild(searchResultsMessage);
            }
            setSearchResultsPosition(); // Adjust if input causes layout shifts, though unlikely here
        });

        searchInput.addEventListener('focus', () => {
            setSearchResultsPosition(); // Ensure position is correct on focus
            const query = searchInput.value.trim();
            if (query.length > 1 && searchResultsDisplay.children.length > 1) { // more than just the message P
                 searchResultsContainer.classList.remove('hidden');
            } else if (query.length === 0) {
                searchResultsDisplay.innerHTML = '';
                searchResultsMessage.textContent = '검색어를 입력하여 페이지 내 콘텐츠를 찾아보세요.';
                searchResultsDisplay.appendChild(searchResultsMessage);
                searchResultsContainer.classList.remove('hidden'); // Show initial message on focus
            }
             const searchIcon = searchInput.parentElement.querySelector('i[data-lucide="search"]');
             if (searchIcon) {
                 searchIcon.classList.remove('text-neutral-light/70');
                 searchIcon.classList.add('text-brand-accent');
             }
        });

        searchInput.addEventListener('blur', () => {
            const searchIcon = searchInput.parentElement.querySelector('i[data-lucide="search"]');
            if (searchIcon) {
                 searchIcon.classList.add('text-neutral-light/70');
                 searchIcon.classList.remove('text-brand-accent');
            }

            setTimeout(() => {
                if (!searchResultsContainer.contains(document.activeElement) && document.activeElement !== searchInput) {
                    searchResultsContainer.classList.add('hidden');
                }
            }, 150);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !searchResultsContainer.classList.contains('hidden')) {
                searchInput.value = '';
                searchResultsContainer.classList.add('hidden');
                searchInput.blur();
            }
        });

    } else {
        console.warn("Search elements not found. Search functionality disabled.");
    }
});
