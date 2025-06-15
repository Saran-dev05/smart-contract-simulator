const { useState } = React;

function UserWallet({ user, onUserUpdate }) {
    const [showDetails, setShowDetails] = useState(false);

    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getReputationColor = (reputation) => {
        if (reputation >= 150) return 'text-green-600';
        if (reputation >= 100) return 'text-blue-600';
        if (reputation >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getReputationBadge = (reputation) => {
        if (reputation >= 150) return 'Excellent';
        if (reputation >= 100) return 'Good';
        if (reputation >= 50) return 'Fair';
        return 'Poor';
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.address.slice(2, 4).toUpperCase()}
                </div>
                <div className="text-left">
                    <p className="font-medium text-gray-900">{formatAddress(user.address)}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{user.tokenBalance} SIM</span>
                        <span>•</span>
                        <span>{user.ethBalance} ETH</span>
                    </div>
                </div>
                <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'} text-gray-400`}></i>
            </button>

            {showDetails && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                {user.address.slice(2, 4).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Wallet Details</p>
                                <p className="text-sm text-gray-600">{user.address}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Token Balances */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium text-gray-900 mb-2">Balances</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-blue-600">{user.tokenBalance}</p>
                                        <p className="text-xs text-gray-600">SIM Tokens</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-green-600">{user.ethBalance}</p>
                                        <p className="text-xs text-gray-600">ETH Balance</p>
                                    </div>
                                </div>
                            </div>

                            {/* Staking Info */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium text-gray-900 mb-2">Staking</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-purple-600">{user.stakingBalance}</p>
                                        <p className="text-xs text-gray-600">Staked</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-orange-600">{user.votingPower}</p>
                                        <p className="text-xs text-gray-600">Voting Power</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reputation */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium text-gray-900 mb-2">Reputation</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-2xl font-bold ${getReputationColor(user.reputation)}`}>
                                            {user.reputation}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.reputation >= 150 ? 'bg-green-100 text-green-800' :
                                            user.reputation >= 100 ? 'bg-blue-100 text-blue-800' :
                                            user.reputation >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {getReputationBadge(user.reputation)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fas fa-star text-sm ${
                                                i < Math.floor(user.reputation / 30) ? 'text-yellow-400' : 'text-gray-300'
                                            }`}></i>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            user.reputation >= 150 ? 'bg-green-500' :
                                            user.reputation >= 100 ? 'bg-blue-500' :
                                            user.reputation >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min((user.reputation / 200) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Account Status</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Close button or click outside to close */}
                    <div className="border-t border-gray-200 p-3">
                        <button
                            onClick={() => setShowDetails(false)}
                            className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close wallet details */}
            {showDetails && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDetails(false)}
                ></div>
            )}
        </div>
    );
}

window.UserWallet = UserWallet;
