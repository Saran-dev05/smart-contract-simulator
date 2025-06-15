class BlockchainSimulator {
    constructor() {
        this.users = new Map();
        this.transactions = [];
        this.blockNumber = 1000000;
        this.networkStats = {
            totalProposals: 0,
            activeStakers: 0,
            totalValueLocked: 0,
            recentActivity: 0
        };
    }

    addUser(user) {
        this.users.set(user.address, {
            ...user,
            joinedAt: Date.now()
        });
        this.updateNetworkStats();
    }

    getUser(address) {
        return this.users.get(address);
    }

    updateUserBalance(address, balanceType, newBalance) {
        const user = this.users.get(address);
        if (user) {
            user[balanceType] = Math.max(0, newBalance);
            this.users.set(address, user);
            this.updateNetworkStats();
        }
    }

    addTransaction(transaction) {
        const tx = {
            ...transaction,
            hash: this.generateTxHash(),
            blockNumber: this.blockNumber++,
            timestamp: Date.now(),
            gasUsed: this.calculateGas(transaction.type),
            status: 'confirmed'
        };
        
        this.transactions.push(tx);
        this.networkStats.recentActivity++;
        return tx;
    }

    generateTxHash() {
        return '0x' + Math.random().toString(16).substr(2, 64);
    }

    calculateGas(txType) {
        const gasTable = {
            'transfer': 21000,
            'stake': 50000,
            'unstake': 45000,
            'vote': 60000,
            'proposal': 80000,
            'bid': 55000,
            'claim': 40000
        };
        return gasTable[txType] || 30000;
    }

    updateNetworkStats() {
        let totalStaked = 0;
        let activeStakers = 0;

        this.users.forEach(user => {
            if (user.stakingBalance > 0) {
                totalStaked += user.stakingBalance;
                activeStakers++;
            }
        });

        this.networkStats = {
            ...this.networkStats,
            activeStakers,
            totalValueLocked: totalStaked
        };
    }

    getNetworkStats() {
        return {
            ...this.networkStats,
            totalUsers: this.users.size,
            totalTransactions: this.transactions.length,
            currentBlock: this.blockNumber
        };
    }

    // Simulate block mining
    mineBlock() {
        this.blockNumber++;
        const block = {
            number: this.blockNumber,
            timestamp: Date.now(),
            transactions: this.transactions.slice(-10), // Last 10 transactions
            hash: this.generateTxHash()
        };
        return block;
    }

    // Simulate network congestion
    getGasPrice() {
        const baseGas = 20000000000; // 20 Gwei
        const congestionMultiplier = 1 + (this.networkStats.recentActivity / 100);
        return Math.floor(baseGas * congestionMultiplier);
    }

    // Security validations
    validateTransaction(tx) {
        const user = this.getUser(tx.from);
        if (!user) {
            throw new Error('User not found');
        }

        if (tx.type === 'transfer' && user.tokenBalance < tx.amount) {
            throw new Error('Insufficient balance');
        }

        return true;
    }

    // Simulate slashing conditions
    checkSlashingConditions(userAddress) {
        const user = this.getUser(userAddress);
        if (!user) return false;

        // Simple slashing simulation - reputation based
        if (user.reputation < 50) {
            return {
                shouldSlash: true,
                reason: 'Low reputation score',
                penalty: user.stakingBalance * 0.1
            };
        }

        return { shouldSlash: false };
    }

    // Event emission
    emitEvent(eventType, data) {
        const event = {
            type: eventType,
            data,
            blockNumber: this.blockNumber,
            timestamp: Date.now(),
            transactionHash: this.generateTxHash()
        };

        // In a real implementation, this would broadcast to connected clients
        console.log('Event emitted:', event);
        return event;
    }
}

module.exports = { BlockchainSimulator };
