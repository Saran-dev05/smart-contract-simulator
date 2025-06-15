const { useState, useEffect } = React;

function App() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialize user session
        initializeUser();
        // Setup event listeners for contract events
        setupEventListeners();
    }, []);

    const initializeUser = async () => {
        try {
            const response = await api.initializeUser();
            setUser(response.user);
        } catch (error) {
            console.error('Failed to initialize user:', error);
            // Create default user if API fails
            setUser({
                address: '0x' + Math.random().toString(16).substr(2, 40),
                tokenBalance: 1000,
                ethBalance: 10,
                stakingBalance: 0,
                votingPower: 0,
                reputation: 100
            });
        }
    };

    const setupEventListeners = () => {
        // Simulate WebSocket connection for real-time events
        const eventSource = new EventSource('/api/events');
        eventSource.onmessage = (event) => {
            const eventData = JSON.parse(event.data);
            setEvents(prev => [eventData, ...prev.slice(0, 49)]); // Keep last 50 events
        };
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const addEvent = (event) => {
        setEvents(prev => [event, ...prev.slice(0, 49)]);
    };

    const navigation = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'voting', label: 'DAO Voting', icon: 'fas fa-vote-yea' },
        { id: 'staking', label: 'Staking Pool', icon: 'fas fa-coins' },
        { id: 'auction', label: 'Auction House', icon: 'fas fa-gavel' }
    ];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Initializing Smart Contract Simulator...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                <i className="fas fa-cube mr-2 text-blue-600"></i>
                                Smart Contract Simulator
                            </h1>
                        </div>
                        <UserWallet user={user} onUserUpdate={handleUserUpdate} />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64">
                        <nav className="bg-white rounded-lg shadow-sm p-4">
                            <ul className="space-y-2">
                                {navigation.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                activeTab === item.id
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <i className={`${item.icon} mr-3`}></i>
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Event Log */}
                        <div className="mt-6">
                            <EventLog events={events} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'dashboard' && (
                            <Dashboard user={user} events={events} />
                        )}
                        {activeTab === 'voting' && (
                            <VotingSystem 
                                user={user} 
                                onUserUpdate={handleUserUpdate}
                                onEvent={addEvent}
                            />
                        )}
                        {activeTab === 'staking' && (
                            <StakingPool 
                                user={user} 
                                onUserUpdate={handleUserUpdate}
                                onEvent={addEvent}
                            />
                        )}
                        {activeTab === 'auction' && (
                            <AuctionHouse 
                                user={user} 
                                onUserUpdate={handleUserUpdate}
                                onEvent={addEvent}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
