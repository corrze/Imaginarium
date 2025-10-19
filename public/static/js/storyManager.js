// storyManager.js - Story management and page creation logic

export const MAX_PAGES = 5;

// Railway API URL
const API_BASE = '';

export class StoryManager {
    constructor() {
        this.storyPages = [];
        this.currentPageIndex = 0;
        this.isGenerating = false;
        this.storyIdea = '';
        this.previousStory = '';
    }

    async initializeStory(storyIdea) {
        this.storyIdea = storyIdea;
        this.storyPages = [];
        this.currentPageIndex = 0;
        this.previousStory = '';
        
        const firstPage = await this.generateStoryPage(storyIdea, null);
        return firstPage;
    }

    async generateStoryPage(storyIdea, userResponse) {
        this.isGenerating = true;
        
        try {
            const pageNumber = this.storyPages.length + 1;
            
            console.log('Calling Railway API...');
            
            // Generate story - using Railway URL
            const storyResponse = await fetch(`${API_BASE}/api/generate-story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyIdea: storyIdea,
                    userResponse: userResponse,
                    pageNumber: pageNumber,
                    previousStory: this.previousStory
                })
            });

            if (!storyResponse.ok) {
                throw new Error(`Story API returned ${storyResponse.status}`);
            }

            const storyData = await storyResponse.json();
            console.log('Story generated:', storyData);
            
            // Update history
            this.previousStory += ' ' + storyData.storyText;
            
            console.log('Calling Railway API for image...');
            
            // Generate image - using Railway URL
            const imageResponse = await fetch(`${API_BASE}/api/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyText: storyData.storyText,
                    pageNumber: pageNumber
                })
            });

            let imageUrl = `https://via.placeholder.com/800x600/6c5ce7/ffffff?text=Page+${pageNumber}`;
            
            if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                console.log('Image generated:', imageData);
                if (imageData.imageUrl) {
                    // Prepend Railway URL if image URL is relative
                    imageUrl = imageData.imageUrl.startsWith('http') 
                        ? imageData.imageUrl 
                        : `${API_BASE}${imageData.imageUrl}`;
                }
            }

            const page = {
                id: `page-${pageNumber}`,
                pageNumber: pageNumber,
                imageUrl: imageUrl,
                storyText: storyData.storyText,
                promptText: storyData.promptText,
                userResponse: userResponse
            };

            this.storyPages.push(page);
            this.currentPageIndex = this.storyPages.length - 1;
            
            console.log('Page created:', page);
            
            return page;
        } catch (error) {
            console.error('Error generating story page:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    goToPreviousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            return this.storyPages[this.currentPageIndex];
        }
        return null;
    }

    goToNextPage() {
        if (this.currentPageIndex < this.storyPages.length - 1) {
            this.currentPageIndex++;
            return this.storyPages[this.currentPageIndex];
        }
        return null;
    }

    getCurrentPage() {
        return this.storyPages[this.currentPageIndex] || null;
    }

    shouldShowConclusion() {
        return this.storyPages.length >= MAX_PAGES;
    }

    getStoryStats() {
        return {
            totalPages: this.storyPages.length,
            maxPages: MAX_PAGES,
            storyIdea: this.storyIdea,
            completionPercentage: Math.round((this.storyPages.length / MAX_PAGES) * 100)
        };
    }

    resetStory() {
        this.storyPages = [];
        this.currentPageIndex = 0;
        this.storyIdea = '';
        this.isGenerating = false;
        this.previousStory = '';
    }

    isAtFirstPage() {
        return this.currentPageIndex === 0;
    }

    isAtLastPage() {
        return this.currentPageIndex === this.storyPages.length - 1;
    }

    getNavigationState() {
        return {
            canGoBack: !this.isAtFirstPage(),
            canGoNext: !this.isAtLastPage(),
            currentPage: this.currentPageIndex + 1,
            totalPages: this.storyPages.length,
            shouldShowConclusion: this.shouldShowConclusion()
        };
    }
}