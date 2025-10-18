// main.js - Main application controller

import { StoryManager } from './storyManager.js';
import { UI } from './ui.js';
import { IntroPage } from './pages/introPage.js';
import { StoryPage } from './pages/storyPage.js';
import { ConclusionPage } from './pages/conclusionPage.js';

class Imaginarium {
    constructor() {
        this.storyManager = new StoryManager();
        this.ui = new UI();
        
        // Initialize page handlers
        this.storyPage = new StoryPage(this.ui, this.storyManager);
        this.conclusionPage = new ConclusionPage(this.ui, this.storyManager);
        this.introPage = new IntroPage(this.ui, this.storyManager, this.storyPage);
        
        this.initializeApp();
    }

    initializeApp() {
        // Set up global event listeners
        this.setupGlobalEvents();
        
        // Show the landing page
        this.showIntroPage();
    }

    setupGlobalEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'Escape':
                this.handleEscape();
                break;
            case 'ArrowLeft':
                if (this.storyPage) {
                    this.storyPage.handleGoBack();
                }
                break;
            case 'ArrowRight':
                if (this.storyPage) {
                    this.storyPage.handleGoNext();
                }
                break;
        }
    }

    handleEscape() {
        // Go back to intro if in story or conclusion
        if (this.ui.storyScreen?.classList.contains('active') || 
            this.ui.conclusionScreen?.classList.contains('active')) {
            this.showIntroPage();
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth < 768;
        
        // Update UI elements based on screen size
        if (isMobile) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    pauseAnimations() {
        // Pause any running animations to save resources
        document.body.style.animationPlayState = 'paused';
    }

    resumeAnimations() {
        // Resume animations
        document.body.style.animationPlayState = 'running';
    }

    // Page navigation methods
    showIntroPage() {
        this.introPage.render();
    }

    showStoryPage() {
        this.storyPage.show();
    }

    showConclusionPage() {
        this.conclusionPage.show();
    }

    // App state management
    getAppState() {
        return {
            currentScreen: this.getCurrentScreen(),
            storyStats: this.storyManager.getStoryStats(),
            navigationState: this.storyManager.getNavigationState()
        };
    }

    getCurrentScreen() {
        if (this.ui.landingScreen?.classList.contains('active')) return 'intro';
        if (this.ui.storyScreen?.classList.contains('active')) return 'story';
        if (this.ui.conclusionScreen?.classList.contains('active')) return 'conclusion';
        return 'intro';
    }

    // Debug and development helpers
    debug() {
        console.log('Imaginarium Debug Info:', {
            appState: this.getAppState(),
            storyManager: this.storyManager,
            ui: this.ui
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imaginarium = new Imaginarium();
    
    // Make debug available in console
    window.debugImaginarium = () => window.imaginarium.debug();
    
    console.log('Imaginarium initialized! Use debugImaginarium() for debug info.');
});
