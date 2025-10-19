// ui.js - UI rendering and DOM updates

export class UI {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        // Screen elements
        this.landingScreen = document.getElementById('landing-screen');
        this.storyScreen = document.getElementById('story-screen');
        this.conclusionScreen = document.getElementById('conclusion-screen');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Landing screen elements
        this.storyInput = document.getElementById('story-input');
        this.createStoryBtn = document.getElementById('create-story-btn');
        
        // Story screen elements
        this.storyPagesContainer = document.getElementById('story-pages-container');
        this.pageCounter = document.getElementById('page-counter');
        this.backBtn = document.getElementById('back-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');
        
        // Conclusion screen elements
        this.conclusionTitle = document.getElementById('conclusion-title');
        this.conclusionMessage = document.getElementById('conclusion-message');
        this.conclusionStats = document.getElementById('conclusion-stats');
        this.conclusionActions = document.getElementById('conclusion-actions');
    }

    // Screen management
    showScreen(screenId) {
        // Hide all screens
        this.landingScreen?.classList.remove('active');
        this.storyScreen?.classList.remove('active');
        this.conclusionScreen?.classList.remove('active');
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showLandingScreen() {
        this.showScreen('landing-screen');
        this.storyInput?.focus();
    }

    showStoryScreen() {
        this.showScreen('story-screen');
    }

    showConclusionScreen() {
        console.log('Showing conclusion screen');
        this.showScreen('conclusion-screen');
        // Trigger conclusion page rendering if we have access to the conclusion page
        if (window.imaginarium && window.imaginarium.conclusionPage) {
            console.log('Rendering conclusion page');
            window.imaginarium.conclusionPage.render();
        } else {
            console.warn('Conclusion page not available');
        }
    }

    // Loading overlay
    showLoading(show = true) {
        if (show) {
            this.loadingOverlay?.classList.add('active');
        } else {
            this.loadingOverlay?.classList.remove('active');
        }
    }

    // Error handling
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#00b894' : '#6c5ce7'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            z-index: 1001;
            animation: slideInDown 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Navigation updates
    updateNavigation(navigationState) {
        if (this.pageCounter) {
            this.pageCounter.textContent = `Page ${navigationState.currentPage} of ${navigationState.totalPages}`;
        }

        if (this.backBtn) {
            this.backBtn.disabled = !navigationState.canGoBack;
        }

        if (this.nextBtn) {
            this.nextBtn.disabled = !navigationState.canGoNext;
        }
    }

    // Story page rendering
    renderStoryPage(page) {
        if (!this.storyPagesContainer || !page) return;

        // Clear existing pages
        this.storyPagesContainer.innerHTML = '';

        // Create page element
        const pageElement = document.createElement('div');
        pageElement.className = 'story-page active';
        pageElement.id = page.id;

        pageElement.innerHTML = `
            <div class="story-image-container">
                <img src="${page.imageUrl}" alt="Story illustration" class="story-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="story-image" style="display: none;">
                            Creating your magical illustration...
                        </div>
            </div>
            
            <div class="story-text">
                ${page.storyText}
            </div>
            
            <div class="story-prompt-container">
                <label class="prompt-label">${page.promptText}</label>
                <input type="text" class="prompt-input" placeholder="Type your idea here..." maxlength="200">
                <button class="prompt-submit">Continue Story</button>
            </div>
        `;

        this.storyPagesContainer.appendChild(pageElement);

        // Focus on input
        const promptInput = pageElement.querySelector('.prompt-input');
        setTimeout(() => promptInput?.focus(), 100);

        return pageElement;
    }

    // Conclusion page rendering
    renderConclusionPage(stats) {
        console.log('renderConclusionPage called with stats:', stats);
        if (!this.conclusionTitle || !this.conclusionMessage) {
            console.warn('Conclusion page elements not found');
            return;
        }

        this.conclusionTitle.textContent = '🎉 Your Adventure is Complete!';
        
        this.conclusionMessage.innerHTML = `
            <p>Congratulations! You've created an amazing ${stats.totalPages}-page adventure based on "${stats.storyIdea}".</p>
            <p>Your story has reached ${stats.completionPercentage}% completion and is ready to be shared!</p>
        `;

        if (this.conclusionStats) {
            this.conclusionStats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${stats.totalPages}</span>
                    <span class="stat-label">Pages Created</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.completionPercentage}%</span>
                    <span class="stat-label">Story Complete</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.maxPages}</span>
                    <span class="stat-label">Max Pages</span>
                </div>
            `;
        }
    }

    // Event binding helpers
    bindEvent(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    bindEvents(events) {
        Object.entries(events).forEach(([selector, eventHandlers]) => {
            const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (element) {
                Object.entries(eventHandlers).forEach(([event, handler]) => {
                    element.addEventListener(event, handler);
                });
            }
        });
    }

    // Utility methods
    getElementValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value.trim() : '';
    }

    setElementValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    clearElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = '';
        }
    }
}
