// pages/introPage.js - Introduction page functionality

export class IntroPage {
    constructor(ui, storyManager, storyPage) {
        this.ui = ui;
        this.storyManager = storyManager;
        this.storyPage = storyPage;
        this.bindEvents();
    }

    bindEvents() {
        // Create story button
        this.ui.bindEvent(this.ui.createStoryBtn, 'click', () => this.handleCreateStory());
        
        // Enter key support
        this.ui.bindEvent(this.ui.storyInput, 'keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleCreateStory();
            }
        });
    }

    async handleCreateStory() {
        const storyIdea = this.ui.getElementValue('story-input');
        
        if (!storyIdea) {
            this.ui.showError('Please tell me your story idea!');
            return;
        }

        this.ui.showLoading(true);
        
        try {
            const firstPage = await this.storyManager.initializeStory(storyIdea);
            this.ui.showStoryScreen();
            // Render the first story page
            this.storyPage.render();
        } catch (error) {
            console.error('Error creating story:', error);
            this.ui.showError('Oops! Something went wrong. Please try again.');
        } finally {
            this.ui.showLoading(false);
        }
    }

    render() {
        this.ui.showLandingScreen();
    }
}
