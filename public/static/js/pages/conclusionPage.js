// pages/conclusionPage.js - Conclusion page functionality

export class ConclusionPage {
    constructor(ui, storyManager) {
        this.ui = ui;
        this.storyManager = storyManager;
        this.bindEvents();
    }

    bindEvents() {
        // Bind conclusion action buttons
        this.ui.bindEvent(document.getElementById('new-story-btn'), 'click', () => this.handleNewStory());
        this.ui.bindEvent(document.getElementById('share-story-btn'), 'click', () => this.handleShareStory());
        this.ui.bindEvent(document.getElementById('view-story-btn'), 'click', () => this.handleViewStory());
    }

    handleNewStory() {
        this.storyManager.resetStory();
        this.ui.clearElement('story-input');
        this.ui.showLandingScreen();
    }

    handleShareStory() {
        // Simple share functionality - could be enhanced with actual sharing
        const stats = this.storyManager.getStoryStats();
        const shareText = `I just created an amazing ${stats.totalPages}-page adventure story with Imaginarium!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Imaginarium Story',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            this.ui.showSuccess('Story copied to clipboard! Share it with your friends!');
        }).catch(() => {
            this.ui.showSuccess('Story ready to share!');
        });
    }

    handleViewStory() {
        // Go back to story view
        this.ui.showStoryScreen();
    }

    render() {
        console.log('ConclusionPage render called');
        const stats = this.storyManager.getStoryStats();
        console.log('Story stats:', stats);
        this.ui.renderConclusionPage(stats);
        this.ui.showConclusionScreen();
    }

    show() {
        this.render();
    }
}
