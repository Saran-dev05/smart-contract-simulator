# Smart Contract Simulator

A comprehensive web-based smart contract simulator that demonstrates interactive blockchain mechanics including DAO governance, staking pools, and auction systems without requiring actual Solidity deployment.

## Features

### Core Functionality
- **DAO Voting System**: Create proposals, stake tokens to vote, execute passed proposals
- **Staking Pool**: Earn 15.5% APY rewards, gain voting power, real-time calculations
- **Auction House**: Bid on digital assets with time-limited auctions
- **User Wallet**: Track balances, reputation, and staking status

### Interactive Elements
- Real state changes through voting, staking, and bidding
- Event logging displays all user actions
- Time-based mechanics for auctions and voting deadlines
- Users start with 1000 SIM tokens and 10 ETH

### Security & Incentives
- Reentrancy guards and access control
- Staking requirements for voting participation
- Reputation-based penalties and slashing mechanisms
- Gas estimation and transaction simulation

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Font Awesome
- **Backend**: Node.js, Express.js
- **Data Storage**: In-memory simulation (Map-based)
- **Architecture**: Service-oriented with separation of concerns

## Quick Start

1. **Install dependencies**:
   ```bash
   cd server
   npm install express cors express-rate-limit
   ```

2. **Start the server**:
   ```bash
   cd server
   node index.js
   ```

3. **Access the application**:
   Open your browser to `http://localhost:5000`

## Project Structure

```
├── public/
│   └── style.css              # Custom CSS styles
├── server/
│   ├── middleware/
│   │   └── security.js        # Security middleware
│   ├── routes/
│   │   └── contract.js        # API endpoints
│   ├── services/
│   │   ├── blockchainSimulator.js  # Core blockchain simulation
│   │   └── contractEngine.js      # Smart contract logic
│   └── index.js               # Server entry point
├── src/
│   ├── components/
│   │   ├── Dashboard.js       # Main dashboard
│   │   ├── VotingSystem.js    # DAO governance
│   │   ├── StakingPool.js     # Token staking
│   │   ├── AuctionHouse.js    # Asset auctions
│   │   ├── UserWallet.js      # User account info
│   │   └── EventLog.js        # Activity feed
│   ├── services/
│   │   └── api.js             # HTTP client
│   ├── utils/
│   │   └── contractSimulator.js  # Client-side validation
│   └── App.js                 # Main React component
└── index.html                 # Entry HTML file
```

## How to Use

### DAO Voting
1. Navigate to "DAO Voting" section
2. Create proposals (requires 100 SIM tokens)
3. Stake tokens in the Staking Pool to gain voting power
4. Vote on active proposals
5. Execute passed proposals after voting period ends

### Staking Pool
1. Go to "Staking Pool" section
2. Stake your SIM tokens to earn 15.5% APY
3. Watch rewards accumulate in real-time
4. Claim rewards when ready
5. Unstake tokens if needed

### Auction House
1. Visit "Auction House" section
2. Browse active auctions
3. Place bids on items you want
4. Monitor auction timers
5. Win auctions to claim items

## API Endpoints

### User Management
- `POST /api/user/initialize` - Create new user
- `GET /api/stats` - Get network statistics

### Proposals
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create new proposal
- `POST /api/proposals/vote` - Vote on proposal
- `POST /api/proposals/:id/execute` - Execute proposal

### Staking
- `GET /api/staking/info` - Get staking information
- `POST /api/staking/stake` - Stake tokens
- `POST /api/staking/unstake` - Unstake tokens
- `POST /api/staking/claim` - Claim rewards

### Auctions
- `GET /api/auctions` - List all auctions
- `POST /api/auctions/bid` - Place bid
- `POST /api/auctions/:id/finalize` - Finalize auction

## Development

### Running in Development
```bash
# Start server
cd server && node index.js

# The application will be available at http://localhost:5000
```

### Architecture Notes
- Uses in-memory storage for demonstration purposes
- Real-time event streaming through Server-Sent Events
- Responsive design optimized for desktop and mobile
- Security middleware includes rate limiting and input validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.