const { useState, useEffect } = React;

function StakingPool({ user, onUserUpdate, onEvent }) {
    const [stakingInfo, setStakingInfo] = useState({
        totalStaked: 0,
        apy: 15.5,
        rewardRate: 0.00001,
        poolSize: 0
    });
    const [stakeAmount, setStakeAmount] = useState('');
    const [unstakeAmount, setUnstakeAmount] = useState('');
    const [rewards, setRewards] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

    useEffect(() => {
        fetchStakingInfo();
        // Update rewards every second
        const interval = setInterval(updateRewards, 1000);
        return () => clearInterval(interval);
    }, [user.stakingBalance]);

    const fetchStakingInfo = async () => {
        try {
            const response = await api.getStakingInfo();
            setStakingInfo(response);
        } catch (error) {
            console.error('Failed to fetch staking info:', error);
        }
    };

    const updateRewards = () => {
        if (user.stakingBalance > 0) {
            const now = Date.now();
            const timeDiff = (now - lastUpdateTime) / 1000; // seconds
            const newRewards = user.stakingBalance * stakingInfo.rewardRate * timeDiff;
            setRewards(prev => prev + newRewards);
            setLastUpdateTime(now);
        }
    };

    const stake = async () => {
        const amount = parseFloat(stakeAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid staking amount');
            return;
        }

        if (amount > user.tokenBalance) {
            alert('Insufficient token balance');
            return;
        }

        setLoading(true);
        try {
            const response = await api.stake({
                amount,
                user: user.address
            });

            if (response.success) {
                const updatedUser = {
                    ...user,
                    tokenBalance: user.tokenBalance - amount,
                    stakingBalance: user.stakingBalance + amount,
                    votingPower: user.stakingBalance + amount
                };
                onUserUpdate(updatedUser);
                onEvent({
                    type: 'stake',
                    title: 'Tokens Staked',
                    description: `Staked ${amount} SIM tokens`,
                    timestamp: new Date().toLocaleTimeString()
                });
                setStakeAmount('');
                fetchStakingInfo();
            }
        } catch (error) {
            console.error('Failed to stake:', error);
            alert('Failed to stake tokens');
        } finally {
            setLoading(false);
        }
    };

    const unstake = async () => {
        const amount = parseFloat(unstakeAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid unstaking amount');
            return;
        }

        if (amount > user.stakingBalance) {
            alert('Insufficient staked balance');
            return;
        }

        setLoading(true);
        try {
            const response = await api.unstake({
                amount,
                user: user.address
            });

            if (response.success) {
                const updatedUser = {
                    ...user,
                    tokenBalance: user.tokenBalance + amount,
                    stakingBalance: user.stakingBalance - amount,
                    votingPower: Math.max(0, user.stakingBalance - amount)
                };
                onUserUpdate(updatedUser);
                onEvent({
                    type: 'unstake',
                    title: 'Tokens Unstaked',
                    description: `Unstaked ${amount} SIM tokens`,
                    timestamp: new Date().toLocaleTimeString()
                });
                setUnstakeAmount('');
                fetchStakingInfo();
            }
        } catch (error) {
            console.error('Failed to unstake:', error);
            alert('Failed to unstake tokens');
        } finally {
            setLoading(false);
        }
    };

    const claimRewards = async () => {
        if (rewards < 0.001) {
            alert('Minimum reward claim is 0.001 SIM');
            return;
        }

        setLoading(true);
        try {
            const response = await api.claimRewards({
                user: user.address,
                amount: rewards
            });

            if (response.success) {
                const updatedUser = {
                    ...user,
                    tokenBalance: user.tokenBalance + rewards
                };
                onUserUpdate(updatedUser);
                onEvent({
                    type: 'reward',
                    title: 'Rewards Claimed',
                    description: `Claimed ${rewards.toFixed(6)} SIM tokens`,
                    timestamp: new Date().toLocaleTimeString()
                });
                setRewards(0);
            }
        } catch (error) {
            console.error('Failed to claim rewards:', error);
            alert('Failed to claim rewards');
        } finally {
            setLoading(false);
        }
    };

    const stakeAll = () => {
        setStakeAmount(user.tokenBalance.toString());
    };

    const unstakeAll = () => {
        setUnstakeAmount(user.stakingBalance.toString());
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Staking Pool</h2>
                <p className="text-gray-600">
                    Stake your SIM tokens to earn rewards and gain voting power in the DAO
                </p>
            </div>

            {/* Pool Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 mr-4">
                            <i className="fas fa-percentage text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Current APY</p>
                            <p className="text-2xl font-bold text-gray-900">{stakingInfo.apy}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 mr-4">
                            <i className="fas fa-coins text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Staked</p>
                            <p className="text-2xl font-bold text-gray-900">{stakingInfo.totalStaked}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 mr-4">
                            <i className="fas fa-users text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pool Size</p>
                            <p className="text-2xl font-bold text-gray-900">{stakingInfo.poolSize}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Staking Dashboard */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Staking Position</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{user.stakingBalance}</p>
                        <p className="text-sm text-gray-600">Staked Balance</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{rewards.toFixed(6)}</p>
                        <p className="text-sm text-gray-600">Pending Rewards</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{user.votingPower}</p>
                        <p className="text-sm text-gray-600">Voting Power</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                            {user.stakingBalance > 0 ? (user.stakingBalance * stakingInfo.apy / 100).toFixed(2) : '0'}
                        </p>
                        <p className="text-sm text-gray-600">Annual Rewards</p>
                    </div>
                </div>

                {rewards > 0.001 && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-green-800">
                                    You have {rewards.toFixed(6)} SIM tokens in rewards ready to claim!
                                </p>
                                <p className="text-sm text-green-600">Rewards are earned continuously while staking</p>
                            </div>
                            <button
                                onClick={claimRewards}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                            >
                                <i className="fas fa-gift mr-2"></i>
                                Claim Rewards
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Staking Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stake Tokens */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stake Tokens</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Stake
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount..."
                                    min="0"
                                    step="0.01"
                                />
                                <button
                                    onClick={stakeAll}
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                    Max
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Available: {user.tokenBalance} SIM
                            </p>
                        </div>
                        <button
                            onClick={stake}
                            disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <i className="fas fa-arrow-up mr-2"></i>
                            {loading ? 'Staking...' : 'Stake Tokens'}
                        </button>
                    </div>
                </div>

                {/* Unstake Tokens */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Unstake Tokens</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Unstake
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={unstakeAmount}
                                    onChange={(e) => setUnstakeAmount(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter amount..."
                                    min="0"
                                    step="0.01"
                                />
                                <button
                                    onClick={unstakeAll}
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                    Max
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Staked: {user.stakingBalance} SIM
                            </p>
                        </div>
                        <button
                            onClick={unstake}
                            disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || user.stakingBalance === 0}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <i className="fas fa-arrow-down mr-2"></i>
                            {loading ? 'Unstaking...' : 'Unstake Tokens'}
                        </button>
                        {user.stakingBalance === 0 && (
                            <p className="text-sm text-gray-500">
                                You have no staked tokens to unstake
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Staking Benefits */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Staking Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">
                            <i className="fas fa-coins mr-2"></i>
                            Earn Rewards
                        </h4>
                        <p className="text-sm opacity-90">Get {stakingInfo.apy}% APY on staked tokens</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">
                            <i className="fas fa-vote-yea mr-2"></i>
                            Voting Power
                        </h4>
                        <p className="text-sm opacity-90">Participate in DAO governance</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <h4 className="font-medium mb-1">
                            <i className="fas fa-shield-alt mr-2"></i>
                            Network Security
                        </h4>
                        <p className="text-sm opacity-90">Help secure the network</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.StakingPool = StakingPool;
