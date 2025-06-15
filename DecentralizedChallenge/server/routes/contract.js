const express = require('express');
const router = express.Router();
const blockchainSimulator = require('../services/blockchainSimulator');
const contractEngine = require('../services/contractEngine');

// Initialize blockchain state
const blockchain = new blockchainSimulator.BlockchainSimulator();
const contracts = new contractEngine.ContractEngine(blockchain);

// User initialization
router.post('/user/initialize', (req, res) => {
    try {
        const userAddress = '0x' + Math.random().toString(16).substr(2, 40);
        const user = {
            address: userAddress,
            tokenBalance: 1000,
            ethBalance: 10,
            stakingBalance: 0,
            votingPower: 0,
            reputation: 100,
            createdAt: new Date().toISOString()
        };

        blockchain.addUser(user);
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Get network statistics
router.get('/stats', (req, res) => {
    try {
        const stats = blockchain.getNetworkStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Proposal endpoints
router.get('/proposals', (req, res) => {
    try {
        const proposals = contracts.getAllProposals();
        res.json({
            success: true,
            proposals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/proposals', (req, res) => {
    try {
        const { title, description, creator } = req.body;
        
        if (!title || !description || !creator) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const user = blockchain.getUser(creator);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const proposal = contracts.createProposal(title, description, creator);
        
        // Deduct proposal creation fee
        blockchain.updateUserBalance(creator, 'tokenBalance', user.tokenBalance - 100);
        
        res.json({
            success: true,
            proposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/proposals/vote', (req, res) => {
    try {
        const { proposalId, support, voter, votingPower } = req.body;
        
        const user = blockchain.getUser(voter);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const proposal = contracts.vote(proposalId, support, voter, votingPower);
        
        res.json({
            success: true,
            proposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/proposals/:id/execute', (req, res) => {
    try {
        const proposalId = parseInt(req.params.id);
        const proposal = contracts.executeProposal(proposalId);
        
        res.json({
            success: true,
            proposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Staking endpoints
router.get('/staking/info', (req, res) => {
    try {
        const info = contracts.getStakingInfo();
        res.json(info);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/staking/stake', (req, res) => {
    try {
        const { amount, user: userAddress } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid staking amount'
            });
        }

        const user = blockchain.getUser(userAddress);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.tokenBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient token balance'
            });
        }

        // Update user balances
        blockchain.updateUserBalance(userAddress, 'tokenBalance', user.tokenBalance - amount);
        blockchain.updateUserBalance(userAddress, 'stakingBalance', user.stakingBalance + amount);
        blockchain.updateUserBalance(userAddress, 'votingPower', user.stakingBalance + amount);

        // Update staking pool
        contracts.addStake(userAddress, amount);
        
        res.json({
            success: true,
            message: 'Tokens staked successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/staking/unstake', (req, res) => {
    try {
        const { amount, user: userAddress } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid unstaking amount'
            });
        }

        const user = blockchain.getUser(userAddress);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.stakingBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient staked balance'
            });
        }

        // Update user balances
        blockchain.updateUserBalance(userAddress, 'tokenBalance', user.tokenBalance + amount);
        blockchain.updateUserBalance(userAddress, 'stakingBalance', user.stakingBalance - amount);
        blockchain.updateUserBalance(userAddress, 'votingPower', Math.max(0, user.stakingBalance - amount));

        // Update staking pool
        contracts.removeStake(userAddress, amount);
        
        res.json({
            success: true,
            message: 'Tokens unstaked successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/staking/claim', (req, res) => {
    try {
        const { user: userAddress, amount } = req.body;
        
        const user = blockchain.getUser(userAddress);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Add rewards to token balance
        blockchain.updateUserBalance(userAddress, 'tokenBalance', user.tokenBalance + amount);
        
        res.json({
            success: true,
            message: 'Rewards claimed successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Auction endpoints
router.get('/auctions', (req, res) => {
    try {
        const auctions = contracts.getAllAuctions();
        res.json({
            success: true,
            auctions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/auctions/bid', (req, res) => {
    try {
        const { auctionId, amount, bidder } = req.body;
        
        const user = blockchain.getUser(bidder);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.tokenBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient token balance'
            });
        }

        const auction = contracts.placeBid(auctionId, amount, bidder);
        
        // Lock tokens for bid (simplified - in real contract would handle refunds)
        blockchain.updateUserBalance(bidder, 'tokenBalance', user.tokenBalance - amount);
        
        res.json({
            success: true,
            auction
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/auctions/:id/finalize', (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);
        const auction = contracts.finalizeAuction(auctionId);
        
        res.json({
            success: true,
            auction
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Server-sent events for real-time updates
router.get('/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send periodic updates
    const interval = setInterval(() => {
        const event = {
            type: 'heartbeat',
            title: 'System Status',
            description: 'All systems operational',
            timestamp: new Date().toLocaleTimeString()
        };
        
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    }, 30000);

    req.on('close', () => {
        clearInterval(interval);
    });
});

module.exports = router;
