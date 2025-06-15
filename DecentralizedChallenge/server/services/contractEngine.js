class ContractEngine {
    constructor(blockchainSimulator) {
        this.blockchain = blockchainSimulator;
        this.proposals = new Map();
        this.auctions = new Map();
        this.stakingPool = {
            totalStaked: 0,
            apy: 15.5,
            rewardRate: 0.00001,
            participants: new Map()
        };
        this.proposalCounter = 1;
        this.auctionCounter = 1;
        
        this.initializeAuctions();
    }

    // Proposal Management
    createProposal(title, description, creator) {
        // Validation
        if (!title || title.trim().length < 5) {
            throw new Error('Proposal title must be at least 5 characters');
        }
        if (!description || description.trim().length < 20) {
            throw new Error('Proposal description must be at least 20 characters');
        }

        const user = this.blockchain.getUser(creator);
        if (!user || user.tokenBalance < 100) {
            throw new Error('Insufficient tokens to create proposal (100 SIM required)');
        }

        const proposal = {
            id: this.proposalCounter++,
            title: title.trim(),
            description: description.trim(),
            creator,
            forVotes: 0,
            againstVotes: 0,
            voters: new Set(),
            status: 'active',
            createdAt: Date.now(),
            endTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        };

        this.proposals.set(proposal.id, proposal);
        this.blockchain.networkStats.totalProposals++;

        // Record transaction
        this.blockchain.addTransaction({
            type: 'proposal',
            from: creator,
            data: { proposalId: proposal.id, title }
        });

        return this.serializeProposal(proposal);
    }

    vote(proposalId, support, voter, votingPower) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.status !== 'active') {
            throw new Error('Proposal is not active');
        }

        if (Date.now() > proposal.endTime) {
            throw new Error('Voting period has ended');
        }

        if (proposal.voters.has(voter)) {
            throw new Error('User has already voted');
        }

        const user = this.blockchain.getUser(voter);
        if (!user || user.stakingBalance === 0) {
            throw new Error('Must stake tokens to vote');
        }

        // Cast vote
        proposal.voters.add(voter);
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }

        // Record transaction
        this.blockchain.addTransaction({
            type: 'vote',
            from: voter,
            data: { proposalId, support, votingPower }
        });

        return this.serializeProposal(proposal);
    }

    executeProposal(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (Date.now() <= proposal.endTime) {
            throw new Error('Voting period has not ended');
        }

        if (proposal.status !== 'active') {
            throw new Error('Proposal is not active');
        }

        // Determine outcome
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = 'passed';
            // In a real contract, this would execute the proposed action
        } else {
            proposal.status = 'failed';
        }

        // Record transaction
        this.blockchain.addTransaction({
            type: 'execution',
            from: 'system',
            data: { proposalId, outcome: proposal.status }
        });

        return this.serializeProposal(proposal);
    }

    getAllProposals() {
        return Array.from(this.proposals.values()).map(p => this.serializeProposal(p));
    }

    serializeProposal(proposal) {
        return {
            ...proposal,
            voters: Array.from(proposal.voters)
        };
    }

    // Staking Management
    getStakingInfo() {
        return {
            ...this.stakingPool,
            totalStaked: this.stakingPool.totalStaked,
            poolSize: this.stakingPool.participants.size
        };
    }

    addStake(userAddress, amount) {
        const participant = this.stakingPool.participants.get(userAddress) || {
            stakedAmount: 0,
            lastRewardTime: Date.now(),
            pendingRewards: 0
        };

        participant.stakedAmount += amount;
        this.stakingPool.participants.set(userAddress, participant);
        this.stakingPool.totalStaked += amount;

        // Record transaction
        this.blockchain.addTransaction({
            type: 'stake',
            from: userAddress,
            data: { amount }
        });
    }

    removeStake(userAddress, amount) {
        const participant = this.stakingPool.participants.get(userAddress);
        if (!participant || participant.stakedAmount < amount) {
            throw new Error('Insufficient staked amount');
        }

        participant.stakedAmount -= amount;
        this.stakingPool.totalStaked -= amount;

        if (participant.stakedAmount === 0) {
            this.stakingPool.participants.delete(userAddress);
        } else {
            this.stakingPool.participants.set(userAddress, participant);
        }

        // Record transaction
        this.blockchain.addTransaction({
            type: 'unstake',
            from: userAddress,
            data: { amount }
        });
    }

    // Auction Management
    initializeAuctions() {
        const now = Date.now();
        const sampleAuctions = [
            {
                id: 1,
                title: "Rare Digital Artwork #001",
                description: "Exclusive NFT artwork by renowned digital artist",
                startingBid: 50,
                currentBid: 125,
                highestBidder: "0x1234567890123456789012345678901234567890",
                endTime: now + 3600000, // 1 hour
                status: "active",
                category: "art",
                bids: []
            },
            {
                id: 2,
                title: "Premium Domain Name",
                description: "crypto-future.eth - Perfect for DeFi projects",
                startingBid: 100,
                currentBid: 200,
                highestBidder: "0x9876543210987654321098765432109876543210",
                endTime: now + 7200000, // 2 hours
                status: "active",
                category: "domain",
                bids: []
            },
            {
                id: 3,
                title: "Virtual Land Parcel",
                description: "Prime location in the metaverse district",
                startingBid: 300,
                currentBid: 450,
                highestBidder: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
                endTime: now + 1800000, // 30 minutes
                status: "active",
                category: "land",
                bids: []
            }
        ];

        sampleAuctions.forEach(auction => {
            this.auctions.set(auction.id, auction);
        });
        this.auctionCounter = 4;
    }

    getAllAuctions() {
        return Array.from(this.auctions.values());
    }

    placeBid(auctionId, amount, bidder) {
        const auction = this.auctions.get(auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }

        if (auction.status !== 'active') {
            throw new Error('Auction is not active');
        }

        if (Date.now() > auction.endTime) {
            throw new Error('Auction has ended');
        }

        if (amount <= auction.currentBid) {
            throw new Error('Bid must be higher than current bid');
        }

        const user = this.blockchain.getUser(bidder);
        if (!user || user.tokenBalance < amount) {
            throw new Error('Insufficient token balance');
        }

        // Record bid
        auction.bids.push({
            bidder,
            amount,
            timestamp: Date.now()
        });

        // Update auction state
        auction.currentBid = amount;
        auction.highestBidder = bidder;

        // Record transaction
        this.blockchain.addTransaction({
            type: 'bid',
            from: bidder,
            data: { auctionId, amount }
        });

        return auction;
    }

    finalizeAuction(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }

        if (Date.now() <= auction.endTime) {
            throw new Error('Auction has not ended yet');
        }

        if (auction.status !== 'active') {
            throw new Error('Auction is not active');
        }

        auction.status = 'completed';

        // Record transaction
        this.blockchain.addTransaction({
            type: 'auction_finalize',
            from: 'system',
            data: { auctionId, winner: auction.highestBidder, amount: auction.currentBid }
        });

        return auction;
    }

    // Security and validation helpers
    requireAuth(userAddress) {
        const user = this.blockchain.getUser(userAddress);
        if (!user) {
            throw new Error('User not authenticated');
        }
        return user;
    }

    requireBalance(userAddress, amount, balanceType = 'tokenBalance') {
        const user = this.requireAuth(userAddress);
        if (user[balanceType] < amount) {
            throw new Error(`Insufficient ${balanceType}`);
        }
        return true;
    }

    requireStaking(userAddress, minAmount = 0) {
        const user = this.requireAuth(userAddress);
        if (user.stakingBalance < minAmount) {
            throw new Error('Insufficient staking balance');
        }
        return true;
    }

    // Slashing mechanism
    applySlashing(userAddress, reason, percentage = 0.1) {
        const user = this.blockchain.getUser(userAddress);
        if (!user || user.stakingBalance === 0) {
            return false;
        }

        const slashAmount = user.stakingBalance * percentage;
        this.blockchain.updateUserBalance(userAddress, 'stakingBalance', user.stakingBalance - slashAmount);
        this.blockchain.updateUserBalance(userAddress, 'reputation', Math.max(0, user.reputation - 20));

        // Record slashing event
        this.blockchain.addTransaction({
            type: 'slash',
            from: 'system',
            to: userAddress,
            data: { reason, amount: slashAmount }
        });

        return slashAmount;
    }
}

module.exports = { ContractEngine };
