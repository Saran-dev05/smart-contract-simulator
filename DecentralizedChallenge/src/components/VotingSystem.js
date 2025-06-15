const { useState, useEffect } = React;

function VotingSystem({ user, onUserUpdate, onEvent }) {
    const [proposals, setProposals] = useState([]);
    const [newProposal, setNewProposal] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const response = await api.getProposals();
            setProposals(response.proposals || []);
        } catch (error) {
            console.error('Failed to fetch proposals:', error);
            setProposals([]);
        }
    };

    const createProposal = async () => {
        if (!newProposal.title.trim() || !newProposal.description.trim()) {
            alert('Please fill in all fields');
            return;
        }

        if (user.tokenBalance < 100) {
            alert('You need at least 100 SIM tokens to create a proposal');
            return;
        }

        setLoading(true);
        try {
            const response = await api.createProposal({
                title: newProposal.title,
                description: newProposal.description,
                creator: user.address
            });

            if (response.success) {
                setProposals(prev => [response.proposal, ...prev]);
                onUserUpdate({ ...user, tokenBalance: user.tokenBalance - 100 });
                onEvent({
                    type: 'proposal',
                    title: 'New Proposal Created',
                    description: `"${newProposal.title}" by ${user.address.slice(0, 8)}...`,
                    timestamp: new Date().toLocaleTimeString()
                });
                setNewProposal({ title: '', description: '' });
                setShowCreateForm(false);
            }
        } catch (error) {
            console.error('Failed to create proposal:', error);
            alert('Failed to create proposal');
        } finally {
            setLoading(false);
        }
    };

    const vote = async (proposalId, support) => {
        if (user.stakingBalance === 0) {
            alert('You need to stake tokens to vote. Visit the Staking Pool first.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.vote({
                proposalId,
                support,
                voter: user.address,
                votingPower: user.stakingBalance
            });

            if (response.success) {
                setProposals(prev => prev.map(p => 
                    p.id === proposalId ? response.proposal : p
                ));
                onEvent({
                    type: 'vote',
                    title: 'Vote Cast',
                    description: `Voted ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId}`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        } catch (error) {
            console.error('Failed to vote:', error);
            alert('Failed to cast vote');
        } finally {
            setLoading(false);
        }
    };

    const executeProposal = async (proposalId) => {
        setLoading(true);
        try {
            const response = await api.executeProposal(proposalId);
            if (response.success) {
                setProposals(prev => prev.map(p => 
                    p.id === proposalId ? { ...p, status: 'executed' } : p
                ));
                onEvent({
                    type: 'execution',
                    title: 'Proposal Executed',
                    description: `Proposal ${proposalId} has been executed`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        } catch (error) {
            console.error('Failed to execute proposal:', error);
            alert('Failed to execute proposal');
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
        
        return `${hours}h ${minutes}m remaining`;
    };

    const ProposalCard = ({ proposal }) => {
        const totalVotes = proposal.forVotes + proposal.againstVotes;
        const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
        const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
        const hasVoted = proposal.voters && proposal.voters.includes(user.address);
        const canExecute = proposal.status === 'active' && 
                          new Date(proposal.endTime) < new Date() && 
                          proposal.forVotes > proposal.againstVotes;

        return (
            <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {proposal.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">{proposal.description}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>
                                <i className="fas fa-user mr-1"></i>
                                {proposal.creator.slice(0, 8)}...
                            </span>
                            <span>
                                <i className="fas fa-clock mr-1"></i>
                                {getTimeRemaining(proposal.endTime)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                proposal.status === 'active' ? 'bg-green-100 text-green-800' :
                                proposal.status === 'passed' ? 'bg-blue-100 text-blue-800' :
                                proposal.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Voting Results */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                        <span>For: {proposal.forVotes} votes ({forPercentage.toFixed(1)}%)</span>
                        <span>Against: {proposal.againstVotes} votes ({againstPercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="flex h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-green-500" 
                                style={{ width: `${forPercentage}%` }}
                            ></div>
                            <div 
                                className="bg-red-500" 
                                style={{ width: `${againstPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Voting Actions */}
                {proposal.status === 'active' && new Date(proposal.endTime) > new Date() && (
                    <div className="flex space-x-3">
                        {!hasVoted ? (
                            <>
                                <button
                                    onClick={() => vote(proposal.id, true)}
                                    disabled={loading || user.stakingBalance === 0}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    <i className="fas fa-thumbs-up mr-2"></i>
                                    Vote For
                                </button>
                                <button
                                    onClick={() => vote(proposal.id, false)}
                                    disabled={loading || user.stakingBalance === 0}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    <i className="fas fa-thumbs-down mr-2"></i>
                                    Vote Against
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-center text-sm font-medium">
                                <i className="fas fa-check mr-2"></i>
                                You have voted
                            </div>
                        )}
                    </div>
                )}

                {canExecute && (
                    <button
                        onClick={() => executeProposal(proposal.id)}
                        disabled={loading}
                        className="w-full mt-3 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                    >
                        <i className="fas fa-play mr-2"></i>
                        Execute Proposal
                    </button>
                )}

                {user.stakingBalance === 0 && proposal.status === 'active' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                            <i className="fas fa-info-circle mr-2"></i>
                            You need to stake tokens to participate in voting
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">DAO Voting System</h2>
                    <p className="text-gray-600">
                        Participate in decentralized governance by creating and voting on proposals
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Create Proposal
                </button>
            </div>

            {/* Create Proposal Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Proposal</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Proposal Title
                            </label>
                            <input
                                type="text"
                                value={newProposal.title}
                                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter proposal title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={newProposal.description}
                                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe your proposal..."
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={createProposal}
                                disabled={loading || user.tokenBalance < 100}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Creating...' : 'Create Proposal (100 SIM)'}
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                        {user.tokenBalance < 100 && (
                            <p className="text-sm text-red-600">
                                You need at least 100 SIM tokens to create a proposal
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Proposals List */}
            <div className="space-y-4">
                {proposals.length > 0 ? (
                    proposals.map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <i className="fas fa-vote-yea text-4xl text-gray-300 mb-4"></i>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
                        <p className="text-gray-600 mb-4">
                            Be the first to create a proposal and start the governance process
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                        >
                            Create First Proposal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

window.VotingSystem = VotingSystem;
