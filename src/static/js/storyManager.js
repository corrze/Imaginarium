// storyManager.js - Story management and page creation logic

export const MAX_PAGES = 5; // Scalable constant for maximum story pages

export class StoryManager {
    constructor() {
        this.storyPages = [];
        this.currentPageIndex = 0;
        this.isGenerating = false;
        this.storyIdea = '';
    }

    // Initialize story with first page
    async initializeStory(storyIdea) {
        this.storyIdea = storyIdea;
        this.storyPages = [];
        this.currentPageIndex = 0;
        
        const firstPage = await this.generateStoryPage(storyIdea, null);
        // Don't push again - generateStoryPage already adds it to the array
        
        return firstPage;
    }

    // Generate a new story page
    async generateStoryPage(storyIdea, userResponse) {
        this.isGenerating = true;
        
        try {
            const pageNumber = this.storyPages.length + 1;
            
            // Call the backend API to generate story content
            const storyResponse = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storyIdea: storyIdea,
                    userResponse: userResponse,
                    pageNumber: pageNumber
                })
            });

            if (!storyResponse.ok) {
                throw new Error('Failed to generate story');
            }

            const storyData = await storyResponse.json();
            
            // Call the backend API to generate image
            const imageResponse = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storyText: storyData.storyText,
                    pageNumber: pageNumber
                })
            });

            let imageUrl = this.generateMockImageUrl(storyIdea, pageNumber);
            if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                imageUrl = imageData.imageUrl;
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
            
            
            return page;
        } catch (error) {
            console.error('Error calling backend API:', error);
            // Fallback to mock data if API fails
            const page = this.createMockStoryPage(storyIdea, userResponse);
            this.storyPages.push(page);
            this.currentPageIndex = this.storyPages.length - 1;
            return page;
        } finally {
            this.isGenerating = false;
        }
    }

    // Create mock story page content
    createMockStoryPage(storyIdea, userResponse) {
        const pageNumber = this.storyPages.length + 1;
        
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

    // Generate mock image URL
    generateMockImageUrl(storyIdea, pageNumber) {
        const colors = ['6c5ce7', '74b9ff', 'fd79a8', 'fdcb6e', '00b894', 'e17055'];
        const color = colors[pageNumber % colors.length];
        return `https://via.placeholder.com/400x300/${color}/ffffff?text=Page+${pageNumber}`;
    }

    // Navigation methods
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

    // Check if we should show conclusion
    shouldShowConclusion() {
        return this.storyPages.length >= MAX_PAGES;
    }

    // Get story statistics for conclusion
    getStoryStats() {
        return {
            totalPages: this.storyPages.length,
            maxPages: MAX_PAGES,
            storyIdea: this.storyIdea,
            completionPercentage: Math.round((this.storyPages.length / MAX_PAGES) * 100)
        };
    }

    // Reset story
    resetStory() {
        this.storyPages = [];
        this.currentPageIndex = 0;
        this.storyIdea = '';
        this.isGenerating = false;
    }

    // Check if at first page
    isAtFirstPage() {
        return this.currentPageIndex === 0;
    }

    // Check if at last page
    isAtLastPage() {
        return this.currentPageIndex === this.storyPages.length - 1;
    }

    // Get navigation state
    getNavigationState() {
        const state = {
            canGoBack: !this.isAtFirstPage(),
            canGoNext: !this.isAtLastPage(),
            currentPage: this.currentPageIndex + 1,
            totalPages: this.storyPages.length,
            shouldShowConclusion: this.shouldShowConclusion()
        };
        
        return state;
    }
}
