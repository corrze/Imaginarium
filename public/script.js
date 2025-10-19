// StoryCrafter - Dynamic Story Generator
class Imaginarium {
    constructor() {
        this.storyPages = [];
        this.currentPageIndex = 0;
        this.isGenerating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.showLandingScreen();
    }

    initializeElements() {
        // Screen elements
        this.landingScreen = document.getElementById('landing-screen');
        this.storyScreen = document.getElementById('story-screen');
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
    }

    bindEvents() {
        // Landing screen events
        this.createStoryBtn.addEventListener('click', () => this.startStory());
        this.storyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.startStory();
            }
        });

        // Navigation events
        this.backBtn.addEventListener('click', () => this.goToPreviousPage());
        this.nextBtn.addEventListener('click', () => this.goToNextPage());
        this.restartBtn.addEventListener('click', () => this.restartStory());
    }

    showLandingScreen() {
        this.landingScreen.classList.add('active');
        this.storyScreen.classList.remove('active');
        this.storyInput.focus();
    }

    showStoryScreen() {
        this.landingScreen.classList.remove('active');
        this.storyScreen.classList.add('active');
    }

    showLoading(show = true) {
        if (show) {
            this.loadingOverlay.classList.add('active');
            this.isGenerating = true;
        } else {
            this.loadingOverlay.classList.remove('active');
            this.isGenerating = false;
        }
    }

    async startStory() {
        const storyIdea = this.storyInput.value.trim();
        if (!storyIdea) {
            this.showInputError('Please tell me your story idea!');
            return;
        }

        this.showLoading(true);
        
        try {
            // Generate the first story page
            const firstPage = await this.generateStoryPage(storyIdea, null);
            this.storyPages = [firstPage];
            this.currentPageIndex = 0;
            
            this.renderCurrentPage();
            this.updateNavigation();
            this.showStoryScreen();
            
        } catch (error) {
            console.error('Error generating story:', error);
            this.showError('Oops! Something went wrong. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async generateStoryPage(storyIdea, userResponse) {
        // Simulate API call with realistic delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const page = this.createMockStoryPage(storyIdea, userResponse);
                resolve(page);
            }, 1500); // Simulate network delay
        });
    }

    createMockStoryPage(storyIdea, userResponse) {
        const pageNumber = this.storyPages.length + 1;
        
        // Generate mock story content based on the story idea and user response
        let storyText = '';
        let promptText = '';
        
        if (pageNumber === 1) {
            storyText = `Once upon a time, in a magical world filled with wonder, there was a brave adventurer who discovered something amazing: "${storyIdea}". The journey was about to begin, and every choice would shape the destiny of this incredible tale.`;
            promptText = 'What happens next in your adventure?';
        } else {
            const responses = [
                'The brave adventurer decided to explore the mysterious path ahead.',
                'A wise old wizard appeared with an important message.',
                'The adventurer discovered a hidden treasure chest.',
                'A friendly dragon offered to help on the journey.',
                'The path led to a magical forest filled with talking animals.',
                'A storm began to brew, changing everything.',
                'The adventurer met a group of helpful friends.',
                'A secret door appeared in the ancient castle wall.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            storyText = `Following the previous adventure, ${randomResponse} This opened up new possibilities and exciting challenges ahead.`;
            promptText = 'What should happen next?';
        }

        return {
            id: `page-${pageNumber}`,
            pageNumber: pageNumber,
            imageUrl: this.generateMockImageUrl(storyIdea, pageNumber),
            storyText: storyText,
            promptText: promptText,
            userResponse: userResponse
        };
    }

    generateMockImageUrl(storyIdea, pageNumber) {
        // Generate a placeholder image URL
        // In a real implementation, this would be the actual generated image from your backend
        const colors = ['6c5ce7', '74b9ff', 'fd79a8', 'fdcb6e', '00b894', 'e17055'];
        const color = colors[pageNumber % colors.length];
        return `https://via.placeholder.com/400x300/${color}/ffffff?text=Page+${pageNumber}`;
    }

    renderCurrentPage() {
        const currentPage = this.storyPages[this.currentPageIndex];
        if (!currentPage) return;

        // Clear existing pages
        this.storyPagesContainer.innerHTML = '';

        // Create page element
        const pageElement = document.createElement('div');
        pageElement.className = 'story-page active';
        pageElement.id = currentPage.id;

        pageElement.innerHTML = `
            <div class="story-image-container">
                <img src="${currentPage.imageUrl}" alt="Story illustration" class="story-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="story-image" style="display: none;">
                    🎨 Creating your magical illustration...
                </div>
            </div>
            
            <div class="story-text">
                ${currentPage.storyText}
            </div>
            
            <div class="story-prompt-container">
                <label class="prompt-label">${currentPage.promptText}</label>
                <input type="text" class="prompt-input" placeholder="Type your idea here..." maxlength="200">
                <button class="prompt-submit">Continue Story</button>
            </div>
        `;

        this.storyPagesContainer.appendChild(pageElement);

        // Bind prompt events
        const promptInput = pageElement.querySelector('.prompt-input');
        const promptSubmit = pageElement.querySelector('.prompt-submit');

        const handlePromptSubmit = async () => {
            const userResponse = promptInput.value.trim();
            if (!userResponse) {
                this.showInputError('Please tell me what happens next!');
                return;
            }

            if (this.isGenerating) return;

            this.showLoading(true);
            
            try {
                // Generate next page
                const nextPage = await this.generateStoryPage(this.storyInput.value, userResponse);
                this.storyPages.push(nextPage);
                this.currentPageIndex = this.storyPages.length - 1;
                
                this.renderCurrentPage();
                this.updateNavigation();
                
            } catch (error) {
                console.error('Error generating next page:', error);
                this.showError('Oops! Something went wrong. Please try again.');
            } finally {
                this.showLoading(false);
            }
        };

        promptSubmit.addEventListener('click', handlePromptSubmit);
        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePromptSubmit();
            }
        });

        // Focus on input
        setTimeout(() => promptInput.focus(), 100);
    }

    goToPreviousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.renderCurrentPage();
            this.updateNavigation();
        }
    }

    goToNextPage() {
        if (this.currentPageIndex < this.storyPages.length - 1) {
            this.currentPageIndex++;
            this.renderCurrentPage();
            this.updateNavigation();
        }
    }

    updateNavigation() {
        // Update page counter
        this.pageCounter.textContent = `Page ${this.currentPageIndex + 1} of ${this.storyPages.length}`;

        // Update navigation buttons
        this.backBtn.disabled = this.currentPageIndex === 0;
        this.nextBtn.disabled = this.currentPageIndex === this.storyPages.length - 1;

        // Update button states
        if (this.currentPageIndex === 0) {
            this.backBtn.classList.add('disabled');
        } else {
            this.backBtn.classList.remove('disabled');
        }

        if (this.currentPageIndex === this.storyPages.length - 1) {
            this.nextBtn.classList.add('disabled');
        } else {
            this.nextBtn.classList.remove('disabled');
        }
    }

    restartStory() {
        if (confirm('Are you sure you want to start a new story? Your current story will be lost.')) {
            this.storyPages = [];
            this.currentPageIndex = 0;
            this.storyInput.value = '';
            this.showLandingScreen();
        }
    }

    showInputError(message) {
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            z-index: 1001;
            animation: slideInDown 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOutUp 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showInputError(message);
    }
}

// Add CSS for error animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
    }
`;
document.head.appendChild(style);

        // Initialize the app when the DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new Imaginarium();
        });
