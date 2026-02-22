import './style.css';

document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementById('gallery');

    try {
        const response = await fetch('items.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const items = await response.json();

        if (items.length === 0) {
            gallery.innerHTML = '<div class="loader">No items currently available.</div>';
            return;
        }

        gallery.innerHTML = ''; // clear loader

        let allTags = new Set();

        // Modal elements
        const modal = document.getElementById('item-modal');
        const modalBody = document.getElementById('modal-body');
        const modalClose = document.getElementById('modal-close');

        // Close modal helper
        const closeModal = () => {
            window.location.hash = ''; // Clear hash triggers hashchange and closes
        };

        modalClose.addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = item.id;

            // Fallback text if missing
            const title = item.title || 'Untitled Item';
            const description = item.description || 'No description provided.';

            const productlink = item.productlink
                ? `<a href="${item.productlink}" target="_blank" rel="noopener noreferrer" class="card-link">Product Link</a>`
                : '';

            let tagsHtml = '';
            if (Array.isArray(item.tags)) {
                tagsHtml = item.tags.map(tag => {
                    allTags.add(tag);
                    return `<span class="tag">${tag}</span>`;
                }).join('');
                card.dataset.tags = JSON.stringify(item.tags); // Store for filtering
            } else {
                card.dataset.tags = '[]';
            }

            card.innerHTML = `
        <a href="#${item.id}" class="card-image-wrapper">
          <img src="${item.image}" alt="${title}" class="card-image" loading="lazy">
        </a>
        <div class="card-content">
          <div class="card-header">
            <h2 class="card-title">
              <a href="#${item.id}" class="title-link">${title}</a>
            </h2>
          </div>
          <p class="card-description">${description}</p>
          ${productlink}
          <div class="card-tags">${tagsHtml}</div>
        </div>
      `;

            gallery.appendChild(card);
        });

        // Render Filters
        const filterBar = document.getElementById('filter-bar');
        if (allTags.size > 0) {
            let filterHtml = `<button class="filter-btn active" data-tag="all">All</button>`;
            Array.from(allTags).sort().forEach(tag => {
                filterHtml += `<button class="filter-btn" data-tag="${tag}">${tag}</button>`;
            });
            filterBar.innerHTML = filterHtml;

            // Filter logic
            const filterBtns = filterBar.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Update active state
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');

                    const selectedTag = e.target.dataset.tag;
                    const cards = gallery.querySelectorAll('.card');

                    cards.forEach(card => {
                        if (selectedTag === 'all') {
                            card.style.display = 'flex';
                        } else {
                            const cardTags = JSON.parse(card.dataset.tags || '[]');
                            if (cardTags.includes(selectedTag)) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        }
                    });
                });
            });
        }

        // Hash Routing Logic for "Separate Page" feel
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                // Close modal
                modal.classList.add('hidden');
                document.body.style.overflow = ''; // restore scrolling
                return;
            }

            const targetItem = items.find(i => i.id === hash);
            if (targetItem) {
                const title = targetItem.title || 'Untitled Item';
                const description = targetItem.description || 'No description provided.';
                const productlink = targetItem.productlink
                    ? `<a href="${targetItem.productlink}" target="_blank" rel="noopener noreferrer" class="card-link btn-primary">View Product Link</a>`
                    : '';
                const tagsHtml = Array.isArray(targetItem.tags)
                    ? targetItem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                    : '';

                modalBody.innerHTML = `
                    <div class="modal-layout">
                        <div class="modal-image-col">
                            <img src="${targetItem.image}" alt="${title}" class="modal-image">
                        </div>
                        <div class="modal-info-col">
                            <h2 class="modal-title">${title}</h2>
                            <div class="card-tags modal-tags">${tagsHtml}</div>
                            <p class="modal-description">${description}</p>
                            ${productlink}
                        </div>
                    </div>
                `;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // prevent background scrolling
            } else {
                // Item not found, clear hash
                window.location.hash = '';
            }
        };

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Check hash on initial load
        if (window.location.hash) {
            handleHashChange();
        }

    } catch (error) {
        if (error instanceof SyntaxError) {
            gallery.innerHTML = '<div class="loader">No items.json found or invalid. Make sure to run the build script.</div>';
        } else {
            console.error('Failed to load items:', error);
            gallery.innerHTML = '<div class="loader" style="color: #ef4444;">Failed to load items. Ensure items.json has been generated.</div>';
        }
    }
});
