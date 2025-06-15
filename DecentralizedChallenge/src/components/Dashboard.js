const { useState, useEffect } = React;

function Dashboard({ user, events }) {
    const [stats, setStats] = useState({
        totalProposals: 0,
        activeStakers: 0,
        totalValueLocked: 0,
        recentActivity: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.getStats();
            setStats(response);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const StatCard = ({ title, value, icon, color = "blue" }) => (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
                    <i className={`${icon} text-${color}-600 text-xl`}></i>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    const recentEvents = events.slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
                <p className="text-gray-600">
                    Welcome to the Smart Contract Simulator. Interact with DAO governance, 
                    staking pools, and auction mechanisms.
                </p>
            </div>

            {/* User Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{user.tokenBalance}</p>
                        <p className="text-sm text-gray-600">SIM Tokens</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{user.ethBalance}</p>
                        <p className="text-sm text-gray-600">ETH Balance</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{user.stakingBalance}</p>
                        <p className="text-sm text-gray-600">Staked Tokens</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{user.votingPower}</p>
                        <p className="text-sm text-gray-600">Voting Power</p>
                    </div>
                </div>
            </div>

            {/* Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Proposals"
                    value={stats.totalProposals}
                    icon="fas fa-file-alt"
                    color="blue"
                />
                <StatCard
                    title="Active Stakers"
                    value={stats.activeStakers}
                    icon="fas fa-users"
                    color="green"
                />
                <StatCard
                    title="Total Value Locked"
                    value={`${stats.totalValueLocked} SIM`}
                    icon="fas fa-lock"
                    color="purple"
                />
                <StatCard
                    title="Recent Activity"
                    value={stats.recentActivity}
                    icon="fas fa-chart-line"
                    color="orange"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Network Activity</h3>
                {recentEvents.length > 0 ? (
                    <div className="space-y-3">
                        {recentEvents.map((event, index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className={`p-2 rounded-full mr-3 ${
                                    event.type === 'vote' ? 'bg-blue-100' :
                                    event.type === 'stake' ? 'bg-green-100' :
                                    event.type === 'bid' ? 'bg-purple-100' : 'bg-gray-100'
                                }`}>
                                    <i className={`${
                                        event.type === 'vote' ? 'fas fa-vote-yea text-blue-600' :
                                        event.type === 'stake' ? 'fas fa-coins text-green-600' :
                                        event.type === 'bid' ? 'fas fa-gavel text-purple-600' : 'fas fa-bell text-gray-600'
                                    } text-sm`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                    <p className="text-xs text-gray-600">{event.description}</p>
                                </div>
                                <span className="text-xs text-gray-500">{event.timestamp}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">No recent activity</p>
                        <p className="text-sm text-gray-400">Start interacting with the contract systems to see activity here</p>
                    </div>
                )}
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                <p className="mb-4 opacity-90">
                    Explore the different smart contract functionalities:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">DAO Voting</h4>
                        <p className="text-sm opacity-90">Participate in governance proposals</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">Staking Pool</h4>
                        <p className="text-sm opacity-90">Stake tokens to earn rewards</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">Auction House</h4>
                        <p className="text-sm opacity-90">Bid on exclusive items</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.Dashboard = Dashboard;
