const { useState, useEffect } = React;

function AuctionHouse({ user, onUserUpdate, onEvent }) {
    const [auctions, setAuctions] = useState([]);
    const [bidAmounts, setBidAmounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchAuctions();
        // Update auction timers every second
        const interval = setInterval(fetchAuctions, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuctions = async () => {
        try {
            const response = await api.getAuctions();
            setAuctions(response.auctions || []);
        } catch (error) {
            console.error('Failed to fetch auctions:', error);
            // Initialize with sample auctions if API fails
            if (auctions.length === 0) {
                initializeSampleAuctions();
            }
        }
    };

    const initializeSampleAuctions = () => {
        const now = Date.now();
        const sampleAuctions = [
            {
                id: 1,
                title: "Rare Digital Artwork #001",
                description: "Exclusive NFT artwork by renowned digital artist",
                startingBid: 50,
                currentBid: 125,
                highestBidder: "0x1234...5678",
                endTime: now + 3600000, // 1 hour from now
                status: "active",
                image: null,
                category: "art"
            },
            {
                id: 2,
                title: "Premium Domain Name",
                description: "crypto-future.eth - Perfect for DeFi projects",
                startingBid: 100,
                currentBid: 200,
                highestBidder: "0x9876...4321",
                endTime: now + 7200000, // 2 hours from now
                status: "active",
                image: null,
                category: "domain"
            },
            {
                id: 3,
                title: "Virtual Land Parcel",
                description: "Prime location in the metaverse district",
                startingBid: 300,
                currentBid: 450,
                highestBidder: "0xabcd...efgh",
                endTime: now + 1800000, // 30 minutes from now
                status: "active",
                image: null,
                category: "land"
            }
        ];
        setAuctions(sampleAuctions);
    };

    const placeBid = async (auctionId) => {
        const bidAmount = parseFloat(bidAmounts[auctionId] || 0);
        const auction = auctions.find(a => a.id === auctionId);
        
        if (!auction) return;
        
        if (!bidAmount || bidAmount <= auction.currentBid) {
            alert(`Bid must be higher than current bid of ${auction.currentBid} SIM`);
            return;
        }

        if (bidAmount > user.tokenBalance) {
            alert('Insufficient token balance');
            return;
        }

        if (new Date(auction.endTime) <= new Date()) {
            alert('Auction has ended');
            return;
        }

        setLoading(true);
        try {
            const response = await api.placeBid({
                auctionId,
                amount: bidAmount,
                bidder: user.address
            });

            if (response.success) {
                // Update auction with new bid
                setAuctions(prev => prev.map(a => 
                    a.id === auctionId 
                        ? { ...a, currentBid: bidAmount, highestBidder: user.address }
                        : a
                ));
                
                // Update user balance (lock tokens for bid)
                onUserUpdate({
                    ...user,
                    tokenBalance: user.tokenBalance - bidAmount
                });

                onEvent({
                    type: 'bid',
                    title: 'Bid Placed',
                    description: `Bid ${bidAmount} SIM on "${auction.title}"`,
                    timestamp: new Date().toLocaleTimeString()
                });

                setBidAmounts(prev => ({ ...prev, [auctionId]: '' }));
            }
        } catch (error) {
            console.error('Failed to place bid:', error);
            alert('Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    const finalizeAuction = async (auctionId) => {
        const auction = auctions.find(a => a.id === auctionId);
        if (!auction || new Date(auction.endTime) > new Date()) return;

        setLoading(true);
        try {
            const response = await api.finalizeAuction(auctionId);
            if (response.success) {
                setAuctions(prev => prev.map(a => 
                    a.id === auctionId ? { ...a, status: 'completed' } : a
                ));
                
                onEvent({
                    type: 'auction_end',
                    title: 'Auction Completed',
                    description: `"${auction.title}" won by ${auction.highestBidder}`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        } catch (error) {
            console.error('Failed to finalize auction:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeRemaining = (endTime) => {
        const now = Date.now();
        const end = new Date(endTime).getTime();
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
        return `${seconds}s remaining`;
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'art': return 'fas fa-palette';
            case 'domain': return 'fas fa-globe';
            case 'land': return 'fas fa-map';
            default: return 'fas fa-cube';
        }
    };

    const AuctionCard = ({ auction }) => {
        const timeRemaining = getTimeRemaining(auction.endTime);
        const hasEnded = new Date(auction.endTime) <= new Date();
        const isWinning = auction.highestBidder === user.address;
        const minBid = auction.currentBid + 1;

        return (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Auction Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <i className={`${getCategoryIcon(auction.category)} text-4xl text-gray-400`}></i>
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{auction.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            auction.status === 'active' && !hasEnded ? 'bg-green-100 text-green-800' :
                            auction.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {hasEnded ? 'Ended' : auction.status}
                        </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{auction.description}</p>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Starting Bid:</span>
                            <span className="font-medium">{auction.startingBid} SIM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current Bid:</span>
                            <span className="font-bold text-lg text-blue-600">{auction.currentBid} SIM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Highest Bidder:</span>
                            <span className={`font-medium ${isWinning ? 'text-green-600' : 'text-gray-900'}`}>
                                {isWinning ? 'You' : `${auction.highestBidder.slice(0, 8)}...`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Time Remaining:</span>
                            <span className={`font-medium ${hasEnded ? 'text-red-600' : 'text-orange-600'}`}>
                                {timeRemaining}
                            </span>
                        </div>
                    </div>

                    {isWinning && !hasEnded && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800 font-medium">
                                <i className="fas fa-trophy mr-2"></i>
                                You are winning this auction!
                            </p>
                        </div>
                    )}

                    {/* Bidding Section */}
                    {auction.status === 'active' && !hasEnded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={bidAmounts[auction.id] || ''}
                                    onChange={(e) => setBidAmounts(prev => ({
                                        ...prev,
                                        [auction.id]: e.target.value
                                    }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Min: ${minBid} SIM`}
                                    min={minBid}
                                    step="1"
                                />
                                <button
                                    onClick={() => placeBid(auction.id)}
                                    disabled={loading || !bidAmounts[auction.id] || parseFloat(bidAmounts[auction.id]) <= auction.currentBid}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <i className="fas fa-gavel mr-2"></i>
                                    Bid
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Available: {user.tokenBalance} SIM
                            </p>
                        </div>
                    )}

                    {/* Auction Ended */}
                    {hasEnded && auction.status === 'active' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => finalizeAuction(auction.id)}
                                disabled={loading}
                                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                            >
                                <i className="fas fa-flag-checkered mr-2"></i>
                                Finalize Auction
                            </button>
                        </div>
                    )}

                    {auction.status === 'completed' && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                            <p className="text-sm text-blue-800 font-medium">
                                <i className="fas fa-check-circle mr-2"></i>
                                Auction Completed
                            </p>
                            {isWinning && (
                                <p className="text-xs text-blue-600 mt-1">Congratulations! You won this auction.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const activeAuctions = auctions.filter(a => a.status === 'active' && new Date(a.endTime) > new Date());
    const endedAuctions = auctions.filter(a => a.status === 'completed' || new Date(a.endTime) <= new Date());

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Auction House</h2>
                <p className="text-gray-600">
                    Bid on exclusive digital assets and collectibles
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'active'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Active Auctions ({activeAuctions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ended')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'ended'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Ended Auctions ({endedAuctions.length})
                    </button>
                </nav>
            </div>

            {/* Auctions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'active' ? (
                    activeAuctions.length > 0 ? (
                        activeAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
                            <i className="fas fa-gavel text-4xl text-gray-300 mb-4"></i>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Auctions</h3>
                            <p className="text-gray-600">
                                Check back later for new auction listings
                            </p>
                        </div>
                    )
                ) : (
                    endedAuctions.length > 0 ? (
                        endedAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
                            <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Ended Auctions</h3>
                            <p className="text-gray-600">
                                Completed auctions will appear here
                            </p>
                        </div>
                    )
                )}
            </div>

            {/* Auction Info */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">How Auctions Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">
                            <i className="fas fa-play mr-2"></i>
                            Place Bids
                        </h4>
                        <p className="text-sm opacity-90">Bid higher than the current bid to lead</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">
                            <i className="fas fa-clock mr-2"></i>
                            Time Limits
                        </h4>
                        <p className="text-sm opacity-90">Each auction has a fixed end time</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">
                            <i className="fas fa-trophy mr-2"></i>
                            Win Items
                        </h4>
                        <p className="text-sm opacity-90">Highest bidder wins when time expires</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.AuctionHouse = AuctionHouse;
