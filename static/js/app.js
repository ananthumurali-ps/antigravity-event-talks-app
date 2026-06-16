document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = document.getElementById('refresh-icon');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const notesContainer = document.getElementById('notes-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-btn');
    
    // Tweet Drawer Elements
    const tweetDrawer = document.getElementById('tweet-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const previewDate = document.getElementById('preview-date');
    const previewType = document.getElementById('preview-type');
    const previewText = document.getElementById('preview-text');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCounter = document.getElementById('char-counter');
    const shareTweetBtn = document.getElementById('share-tweet-btn');

    // Theme Toggle Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');

    let selectedItemData = null;
    let currentEntries = [];

    // Load stored theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleIcon.className = 'fa-regular fa-moon';
    }

    // Initialize
    fetchReleaseNotes();

    // Event Listeners
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    retryBtn.addEventListener('click', fetchReleaseNotes);
    exportCsvBtn.addEventListener('click', exportToCsv);
    closeDrawerBtn.addEventListener('click', closeTweetDrawer);
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggleIcon.className = isLight ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    });
    
    tweetTextarea.addEventListener('input', updateCharCount);

    shareTweetBtn.addEventListener('click', () => {
        if (!tweetTextarea.value.trim()) return;
        const text = encodeURIComponent(tweetTextarea.value.trim());
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    });

    // Helper functions
    function showLoading() {
        errorContainer.classList.add('hidden');
        refreshIcon.classList.add('fa-spin-custom');
        refreshBtn.disabled = true;
        
        // Render Skeletons
        notesContainer.innerHTML = Array(3).fill(0).map(() => `
            <div class="day-group skeleton-day">
                <div class="day-header">
                    <div class="skeleton-text" style="width: 200px;"></div>
                    <div class="skeleton-text" style="width: 50px;"></div>
                </div>
                <div class="day-items-list">
                    ${Array(2).fill(0).map(() => `
                        <div class="note-card" style="pointer-events: none;">
                            <div class="note-card-header">
                                <div class="skeleton-badge"></div>
                                <div class="skeleton-text" style="width: 20px;"></div>
                            </div>
                            <div class="note-card-content">
                                <div class="skeleton-text long"></div>
                                <div class="skeleton-text medium"></div>
                                <div class="skeleton-text short"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function hideLoading() {
        refreshIcon.classList.remove('fa-spin-custom');
        refreshBtn.disabled = false;
    }

    function showError(msg) {
        hideLoading();
        notesContainer.innerHTML = '';
        errorMessage.textContent = msg || 'An unexpected error occurred while fetching release notes.';
        errorContainer.classList.remove('hidden');
    }

    async function fetchReleaseNotes() {
        showLoading();
        try {
            const response = await fetch('/api/notes');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server responded with an error status.');
            }
            const data = await response.json();
            currentEntries = data.entries || [];
            renderReleaseNotes(currentEntries);
        } catch (error) {
            console.error('Fetch error:', error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    function renderReleaseNotes(entries) {
        if (!entries || entries.length === 0) {
            notesContainer.innerHTML = `
                <div class="error-panel">
                    <div class="error-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <h3>No release notes found</h3>
                    <p>The release notes feed is currently empty.</p>
                </div>
            `;
            return;
        }

        notesContainer.innerHTML = '';

        entries.forEach((entry, entryIndex) => {
            const parsedItems = parseHtmlContent(entry.content);
            if (parsedItems.length === 0) return;

            const dayGroup = document.createElement('div');
            dayGroup.className = 'day-group';
            
            dayGroup.innerHTML = `
                <div class="day-header">
                    <h2 class="day-title">
                        <i class="fa-regular fa-calendar-days"></i>
                        <span>${entry.title}</span>
                    </h2>
                    <span class="day-notes-count">${parsedItems.length} update${parsedItems.length > 1 ? 's' : ''}</span>
                </div>
                <div class="day-items-list"></div>
            `;

            const listContainer = dayGroup.querySelector('.day-items-list');

            parsedItems.forEach((item, itemIndex) => {
                const card = document.createElement('div');
                card.className = 'note-card';
                
                // Add unique color style depending on type
                const badgeClass = getBadgeClass(item.type);
                const colorVar = getBadgeColorVariable(item.type);
                card.style.setProperty('--badge-color', `var(${colorVar})`);

                card.innerHTML = `
                    <div class="note-card-header">
                        <span class="badge ${badgeClass}">${item.type}</span>
                        <div class="card-actions">
                            <button class="card-action-btn copy-btn" title="Copy to clipboard">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                            <button class="card-action-btn tweet-btn" title="Tweet this update">
                                <i class="fa-brands fa-twitter"></i>
                            </button>
                        </div>
                    </div>
                    <div class="note-card-content">${item.body}</div>
                `;

                // Copy to clipboard handler
                const copyBtn = card.querySelector('.copy-btn');
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card selection click trigger
                    
                    // Extract plain text content of the card
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = item.body;
                    const plainText = tempDiv.textContent.trim();
                    const formattedText = `[BigQuery Release - ${item.type} (${entry.title})]\n${plainText}`;
                    
                    navigator.clipboard.writeText(formattedText).then(() => {
                        copyBtn.classList.add('copied');
                        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                        setTimeout(() => {
                            copyBtn.classList.remove('copied');
                            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                });

                // Tweet button click handler
                const tweetBtn = card.querySelector('.tweet-btn');
                tweetBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent double trigger
                    document.querySelectorAll('.note-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    openTweetDrawer(entry.title, item);
                });

                // Card Click Handlers (General card body click triggers selection & drawer)
                card.addEventListener('click', (e) => {
                    // Prevent drawer trigger if clicking links inside card content or other interactive elements
                    if (e.target.tagName === 'A' || e.target.closest('.card-action-btn')) return;
                    
                    // Toggle selection state
                    document.querySelectorAll('.note-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    
                    openTweetDrawer(entry.title, item);
                });

                listContainer.appendChild(card);
            });

            notesContainer.appendChild(dayGroup);
        });
    }

    // Parse HTML string to separate out items marked by h3 headers
    function parseHtmlContent(htmlContent) {
        if (!htmlContent) return [];
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const items = [];
        let currentItem = null;

        // Iterate through top-level elements of body
        Array.from(doc.body.children).forEach(child => {
            if (child.tagName === 'H3') {
                if (currentItem) {
                    items.push(currentItem);
                }
                currentItem = {
                    type: child.textContent.trim(),
                    body: ''
                };
            } else if (currentItem) {
                currentItem.body += child.outerHTML;
            }
        });

        if (currentItem) {
            items.push(currentItem);
        }

        // Fallback: if no H3 tag was found but content exists, treat whole content as one item
        if (items.length === 0 && htmlContent.trim()) {
            items.push({
                type: 'Update',
                body: htmlContent
            });
        }

        return items;
    }

    function getBadgeClass(type) {
        const t = type.toLowerCase();
        if (t.includes('feature')) return 'badge-feature';
        if (t.includes('issue')) return 'badge-issue';
        if (t.includes('change')) return 'badge-change';
        if (t.includes('deprecated') || t.includes('deprecation')) return 'badge-deprecation';
        return 'badge-default';
    }

    function getBadgeColorVariable(type) {
        const t = type.toLowerCase();
        if (t.includes('feature')) return '--color-feature';
        if (t.includes('issue')) return '--color-issue';
        if (t.includes('change')) return '--color-change';
        if (t.includes('deprecated') || t.includes('deprecation')) return '--color-deprecation';
        return '--color-default';
    }

    // Tweet Drawer Operations
    function openTweetDrawer(date, item) {
        selectedItemData = { date, item };
        
        previewDate.textContent = date;
        previewType.textContent = item.type;
        
        // Remove badge classes and add current one
        previewType.className = `badge ${getBadgeClass(item.type)}`;
        previewType.style.setProperty('--badge-color', `var(${getBadgeColorVariable(item.type)})`);
        
        // Update Preview HTML content
        previewText.innerHTML = item.body;

        // Create initial tweet text
        const plainText = previewText.textContent.trim();
        const truncatedText = plainText.length > 180 ? plainText.substring(0, 180) + '...' : plainText;
        
        // Construct standard tweet layout: Type: content #BigQuery
        const initialTweet = `[BigQuery Release - ${item.type}] ${truncatedText} #GoogleCloud #BigQuery`;
        
        tweetTextarea.value = initialTweet;
        updateCharCount();

        // Reveal Drawer
        tweetDrawer.classList.remove('hidden');
    }

    function closeTweetDrawer() {
        tweetDrawer.classList.add('hidden');
        document.querySelectorAll('.note-card').forEach(c => c.classList.remove('selected'));
        selectedItemData = null;
    }

    function updateCharCount() {
        const count = tweetTextarea.value.length;
        charCounter.textContent = `${count} / 280`;

        // Style based on limits
        charCounter.className = '';
        if (count > 280) {
            charCounter.classList.add('danger');
            shareTweetBtn.disabled = true;
        } else if (count > 250) {
            charCounter.classList.add('warning');
            shareTweetBtn.disabled = false;
        } else {
            shareTweetBtn.disabled = false;
        }
    }

    // Export entire loaded dataset as CSV
    function exportToCsv() {
        if (!currentEntries || currentEntries.length === 0) {
            alert('No release notes available to export.');
            return;
        }

        const csvRows = [];
        // Header
        csvRows.push(['Date', 'Type', 'Content', 'Link'].map(val => `"${val.replace(/"/g, '""')}"`).join(','));

        currentEntries.forEach(entry => {
            const items = parseHtmlContent(entry.content);
            items.forEach(item => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.body;
                const plainText = tempDiv.textContent.trim().replace(/\s+/g, ' '); // Clean whitespaces
                
                const dateVal = entry.title;
                const typeVal = item.type;
                const contentVal = plainText;
                const linkVal = entry.link || '';

                const row = [dateVal, typeVal, contentVal, linkVal].map(val => `"${val.replace(/"/g, '""')}"`).join(',');
                csvRows.push(row);
            });
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bigquery_release_notes_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    }
});
