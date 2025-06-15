function EventLog({ events }) {
    const getEventIcon = (type) => {
        switch (type) {
            case 'vote': return 'fas fa-vote-yea text-blue-600';
            case 'stake': return 'fas fa-arrow-up text-green-600';
            case 'unstake': return 'fas fa-arrow-down text-red-600';
            case 'bid': return 'fas fa-gavel text-purple-600';
            case 'proposal': return 'fas fa-file-alt text-blue-600';
            case 'reward': return 'fas fa-gift text-green-600';
            case 'execution': return 'fas fa-play text-purple-600';
            case 'auction_end': return 'fas fa-flag-checkered text-orange-600';
            default: return 'fas fa-bell text-gray-600';
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'vote': return 'bg-blue-50 border-blue-200';
            case 'stake': return 'bg-green-50 border-green-200';
            case 'unstake': return 'bg-red-50 border-red-200';
            case 'bid': return 'bg-purple-50 border-purple-200';
            case 'proposal': return 'bg-blue-50 border-blue-200';
            case 'reward': return 'bg-green-50 border-green-200';
            case 'execution': return 'bg-purple-50 border-purple-200';
            case 'auction_end': return 'bg-orange-50 border-orange-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                    <i className="fas fa-history mr-2 text-gray-600"></i>
                    Event Log
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Recent network activity
                </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
                {events.length > 0 ? (
                    <div className="p-4 space-y-3">
                        {events.map((event, index) => (
                            <div 
                                key={index} 
                                className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <i className={`${getEventIcon(event.type)} text-sm`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {event.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {event.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {event.timestamp}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <i className="fas fa-history text-3xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500 text-sm">No events yet</p>
                        <p className="text-gray-400 text-xs mt-1">
                            Activity will appear here as you interact with the system
                        </p>
                    </div>
                )}
            </div>
            
            {events.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        Showing {Math.min(events.length, 50)} recent events
                    </p>
                </div>
            )}
        </div>
    );
}

window.EventLog = EventLog;
