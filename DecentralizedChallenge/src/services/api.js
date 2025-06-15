const API_BASE_URL = '';

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // User Management
    async initializeUser() {
        return this.request('/user/initialize', {
            method: 'POST',
            body: {}
        });
    }

    // Stats
    async getStats() {
        return this.request('/stats');
    }

    // Proposals
    async getProposals() {
        return this.request('/proposals');
    }

    async createProposal(data) {
        return this.request('/proposals', {
            method: 'POST',
            body: data
        });
    }

    async vote(data) {
        return this.request('/proposals/vote', {
            method: 'POST',
            body: data
        });
    }

    async executeProposal(proposalId) {
        return this.request(`/proposals/${proposalId}/execute`, {
            method: 'POST'
        });
    }

    // Staking
    async getStakingInfo() {
        return this.request('/staking/info');
    }

    async stake(data) {
        return this.request('/staking/stake', {
            method: 'POST',
            body: data
        });
    }

    async unstake(data) {
        return this.request('/staking/unstake', {
            method: 'POST',
            body: data
        });
    }

    async claimRewards(data) {
        return this.request('/staking/claim', {
            method: 'POST',
            body: data
        });
    }

    // Auctions
    async getAuctions() {
        return this.request('/auctions');
    }

    async placeBid(data) {
        return this.request('/auctions/bid', {
            method: 'POST',
            body: data
        });
    }

    async finalizeAuction(auctionId) {
        return this.request(`/auctions/${auctionId}/finalize`, {
            method: 'POST'
        });
    }
}

const api = new ApiService();
window.api = api;
