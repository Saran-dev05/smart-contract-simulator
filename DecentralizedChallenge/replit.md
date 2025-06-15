# Smart Contract Simulator

## Overview

The Smart Contract Simulator is a full-stack web application that simulates blockchain interactions including DAO governance, staking pools, and auction mechanisms. It provides a realistic environment for users to interact with smart contract functionalities without requiring actual blockchain deployment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 (loaded via CDN with Babel transpilation)
- **Styling**: Tailwind CSS for responsive design and component styling
- **Icons**: Font Awesome for consistent iconography
- **State Management**: React hooks (useState, useEffect) for local component state
- **Module Loading**: Browser-native ES6 modules with Babel transformation

### Backend Architecture
- **Runtime**: Node.js 20
- **Framework**: Express.js 5.1.0 for REST API endpoints
- **Architecture Pattern**: Service-oriented with separation of concerns
- **Data Layer**: In-memory storage with Map-based data structures
- **Security**: Rate limiting and input validation middleware

## Key Components

### Frontend Components
1. **App.js** - Main application component with routing and state management
2. **Dashboard.js** - Overview dashboard with statistics and user info
3. **VotingSystem.js** - DAO governance with proposal creation and voting
4. **StakingPool.js** - Token staking with real-time reward calculations
5. **AuctionHouse.js** - NFT/asset auction system with bidding mechanics
6. **UserWallet.js** - User balance and account information display
7. **EventLog.js** - Real-time activity feed with event categorization

### Backend Services
1. **BlockchainSimulator** - Core blockchain state management and user tracking
2. **ContractEngine** - Smart contract logic for proposals, auctions, and staking
3. **Security Middleware** - Rate limiting and input sanitization
4. **Contract Routes** - RESTful API endpoints for contract interactions

### Utility Systems
1. **ContractSimulator** - Client-side contract validation and security checks
2. **API Service** - Centralized HTTP client for backend communication

## Data Flow

### User Initialization
1. Frontend requests user initialization from `/api/user/initialize`
2. Backend generates unique wallet address and default balances
3. User state stored in blockchain simulator and returned to frontend
4. Frontend updates local state and enables contract interactions

### Contract Interactions
1. User actions trigger validation on frontend using ContractSimulator
2. API requests sent to appropriate backend endpoints
3. ContractEngine processes business logic and updates blockchain state
4. Transactions recorded with hash generation and gas calculation
5. Events emitted for real-time activity updates
6. Frontend state updated with new balances and contract states

### Real-time Updates
1. Event streaming through Server-Sent Events (EventSource)
2. Periodic polling for time-sensitive data (auctions, staking rewards)
3. Automatic UI updates based on state changes

## External Dependencies

### Frontend Dependencies (CDN)
- React 18.x for component framework
- ReactDOM 18.x for DOM rendering
- Babel Standalone for JSX transformation
- Tailwind CSS for styling framework
- Font Awesome 6.4.0 for icons

### Backend Dependencies (NPM)
- **express** (^5.1.0): Web application framework
- **cors** (^2.8.5): Cross-origin request handling
- **express-rate-limit** (^7.5.0): API rate limiting protection

## Deployment Strategy

### Development Environment
- Replit-based development with Node.js 20 runtime
- File serving through Express static middleware
- Hot reloading through browser refresh (no build process)
- Port 8000 for development server with external port 80 mapping

### Production Considerations
- Static file serving for frontend assets
- In-memory data storage (suitable for demo/simulation)
- Rate limiting for API protection
- Error handling and logging middleware
- CORS configuration for cross-origin requests

### Scaling Considerations
- Database integration would be needed for persistent storage
- WebSocket implementation for real-time events at scale
- Session management for multi-user environments
- Container deployment for production environments

## Changelog

```
Changelog:
- June 15, 2025: Initial setup with basic smart contract simulator structure
- June 15, 2025: Built comprehensive interactive smart contract simulator with DAO voting, staking pool, and auction house features
- June 15, 2025: Implemented security features including reentrancy guards, access control, and input validation
- June 15, 2025: Added real-time event logging and user interaction tracking
- June 15, 2025: Deployed working application on port 5000 with all core functionalities operational
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```