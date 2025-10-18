// pages/storyPage.js - Story page functionality

export class StoryPage {
    constructor(ui, storyManager) {
        this.ui = ui;
        this.storyManager = storyManager;
        this.bindEvents();
    }

    bindEvents() {
        // Navigation buttons
        this.ui.bindEvent(this.ui.backBtn, 'click', () => this.handleGoBack());
        this.ui.bindEvent(this.ui.nextBtn, 'click', () => this.handleGoNext());
        this.ui.bindEvent(this.ui.restartBtn, 'click', () => this.handleRestart());
    }

    async handlePromptSubmit(userResponse) {
        if (!userResponse) {
            this.ui.showError('Please tell me what happens next!');
            return;
        }

        if (this.storyManager.isGenerating) return;

        this.ui.showLoading(true);
        
        try {
            const nextPage = await this.storyManager.generateStoryPage(this.storyManager.storyIdea, userResponse);
            
            // Check if we should show conclusion
            if (this.storyManager.shouldShowConclusion()) {
                this.ui.showConclusionScreen();
                return;
            }
            
            this.render();
            this.updateNavigation();
            
        } catch (error) {
            console.error('Error generating next page:', error);
            this.ui.showError('Oops! Something went wrong. Please try again.');
        } finally {
            this.ui.showLoading(false);
        }
    }

    handleGoBack() {
        const previousPage = this.storyManager.goToPreviousPage();
        if (previousPage) {
            this.render();
            this.updateNavigation();
        }
    }

    handleGoNext() {
        const nextPage = this.storyManager.goToNextPage();
        if (nextPage) {
            this.render();
            this.updateNavigation();
        }
    }

    handleRestart() {
        if (confirm('Are you sure you want to start a new story? Your current story will be lost.')) {
            this.storyManager.resetStory();
            this.ui.clearElement('story-input');
            this.ui.showLandingScreen();
        }
    }

    render() {
        const currentPage = this.storyManager.getCurrentPage();
        if (!currentPage) return;

        const pageElement = this.ui.renderStoryPage(currentPage);
        
        // Bind prompt events for this page
        this.bindPromptEvents(pageElement);
        
        this.updateNavigation();
    }

    bindPromptEvents(pageElement) {
        const promptInput = pageElement.querySelector('.prompt-input');
        const promptSubmit = pageElement.querySelector('.prompt-submit');

        const handleSubmit = () => {
            const userResponse = promptInput.value.trim();
            this.handlePromptSubmit(userResponse);
        };

        this.ui.bindEvent(promptSubmit, 'click', handleSubmit);
        this.ui.bindEvent(promptInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });
    }

    updateNavigation() {
        const navigationState = this.storyManager.getNavigationState();
        this.ui.updateNavigation(navigationState);
    }

    show() {
        this.ui.showStoryScreen();
        this.render();
    }
}
