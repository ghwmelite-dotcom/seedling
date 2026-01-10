import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Simulated bank institutions
const BANKS = [
  { id: 'chase', name: 'Chase', logo: '🏦', color: 'from-blue-600 to-blue-800' },
  { id: 'bofa', name: 'Bank of America', logo: '🏛️', color: 'from-red-600 to-red-800' },
  { id: 'wells', name: 'Wells Fargo', logo: '🐴', color: 'from-yellow-600 to-red-700' },
  { id: 'citi', name: 'Citibank', logo: '🌐', color: 'from-blue-500 to-cyan-600' },
  { id: 'usbank', name: 'US Bank', logo: '🇺🇸', color: 'from-purple-600 to-purple-800' },
  { id: 'capital', name: 'Capital One', logo: '💳', color: 'from-red-500 to-orange-600' },
  { id: 'schwab', name: 'Charles Schwab', logo: '📈', color: 'from-cyan-500 to-blue-600' },
  { id: 'fidelity', name: 'Fidelity', logo: '🎯', color: 'from-green-600 to-emerald-700' },
  { id: 'vanguard', name: 'Vanguard', logo: '⛵', color: 'from-red-700 to-red-900' },
  { id: 'amex', name: 'American Express', logo: '💎', color: 'from-blue-400 to-blue-600' },
];

// Simulated account types
const generateAccounts = (bank) => {
  const baseChecking = 5000 + Math.random() * 15000;
  const baseSavings = 10000 + Math.random() * 40000;
  const baseInvestment = 50000 + Math.random() * 200000;
  const baseRetirement = 100000 + Math.random() * 300000;

  return [
    {
      id: `${bank.id}-checking`,
      type: 'checking',
      name: `${bank.name} Checking`,
      balance: Math.round(baseChecking),
      icon: '💵',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `${bank.id}-savings`,
      type: 'savings',
      name: `${bank.name} Savings`,
      balance: Math.round(baseSavings),
      icon: '🏦',
      lastUpdated: new Date().toISOString(),
    },
    ...(Math.random() > 0.5 ? [{
      id: `${bank.id}-investment`,
      type: 'investment',
      name: `${bank.name} Brokerage`,
      balance: Math.round(baseInvestment),
      icon: '📈',
      lastUpdated: new Date().toISOString(),
    }] : []),
    ...(Math.random() > 0.6 ? [{
      id: `${bank.id}-retirement`,
      type: 'retirement',
      name: `${bank.name} 401(k)`,
      balance: Math.round(baseRetirement),
      icon: '🏖️',
      lastUpdated: new Date().toISOString(),
    }] : []),
  ];
};

// Bank selection modal
const BankSelectionModal = ({ isOpen, onClose, onSelect, connectedBanks }) => {
  const [search, setSearch] = useState('');

  const filteredBanks = BANKS.filter(
    bank => !connectedBanks.includes(bank.id) &&
    bank.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Connect Your Bank</h2>
            <p className="text-slate-400 text-sm">Securely link your financial accounts</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banks..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-seedling-500"
          />
        </div>

        {/* Bank list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredBanks.map((bank) => (
            <motion.button
              key={bank.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(bank)}
              className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center gap-4 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bank.color} flex items-center justify-center`}>
                <span className="text-2xl">{bank.logo}</span>
              </div>
              <span className="text-white font-medium">{bank.name}</span>
              <svg className="w-5 h-5 text-slate-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ))}

          {filteredBanks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No banks found matching "{search}"
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/50 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-slate-400 text-xs">
            Your credentials are encrypted and never stored. We use bank-level security to protect your data.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Bank connection flow modal
const ConnectionFlowModal = ({ bank, onComplete, onClose }) => {
  const [step, setStep] = useState('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const handleConnect = () => {
    setIsLoading(true);
    // Simulate connection delay
    setTimeout(() => {
      setAccounts(generateAccounts(bank));
      setStep('accounts');
      setIsLoading(false);
    }, 2000);
  };

  const handleFinish = () => {
    onComplete(bank, accounts);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700"
      >
        {/* Bank header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bank.color} flex items-center justify-center`}>
            <span className="text-3xl">{bank.logo}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{bank.name}</h2>
            <p className="text-slate-400 text-sm">
              {step === 'credentials' ? 'Enter your credentials' : 'Select accounts to link'}
            </p>
          </div>
        </div>

        {step === 'credentials' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Simulated login form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-seedling-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-seedling-500"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-seedling-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Connecting securely...
                </>
              ) : (
                'Connect'
              )}
            </motion.button>

            <button
              onClick={onClose}
              className="w-full mt-3 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {step === 'accounts' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-3 mb-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 rounded-xl bg-slate-800 flex items-center gap-4"
                >
                  <span className="text-2xl">{account.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">{account.name}</div>
                    <div className="text-slate-400 text-sm capitalize">{account.type}</div>
                  </div>
                  <div className="text-seedling-400 font-bold">
                    {formatCurrency(account.balance, 'USD')}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-seedling-500/10 border border-seedling-500/30 mb-6">
              <div className="flex items-center gap-2 text-seedling-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  {accounts.length} accounts found
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Total: {formatCurrency(accounts.reduce((sum, a) => sum + a.balance, 0), 'USD')}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-seedling-500 text-white font-semibold"
            >
              Link All Accounts
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Connected account card
const AccountCard = ({ account, bank, onRefresh, onRemove }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefresh(account.id);
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bank.color} flex items-center justify-center`}>
          <span className="text-xl">{account.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{account.name}</div>
          <div className="text-slate-500 text-xs capitalize">{account.type}</div>
        </div>
        <div className="text-right">
          <div className="text-seedling-400 font-bold">{formatCurrency(account.balance, 'USD')}</div>
          <div className="text-slate-500 text-xs">
            Updated {new Date(account.lastUpdated).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <motion.svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </motion.svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(account.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Bank Integration Component
const BankIntegration = ({ onNetWorthUpdate }) => {
  const { simulation, currency } = useStore();
  const [showBankSelection, setShowBankSelection] = useState(false);
  const [connectingBank, setConnectingBank] = useState(null);
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seedling_connected_accounts');
    if (saved) {
      const data = JSON.parse(saved);
      setConnectedBanks(data.banks || []);
      setAccounts(data.accounts || []);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('seedling_connected_accounts', JSON.stringify({
      banks: connectedBanks,
      accounts,
    }));
  }, [connectedBanks, accounts]);

  // Calculate totals
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const accountsByType = accounts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.balance;
    return acc;
  }, {});

  const handleBankSelect = (bank) => {
    setShowBankSelection(false);
    setConnectingBank(bank);
  };

  const handleConnectionComplete = (bank, newAccounts) => {
    setConnectedBanks([...connectedBanks, bank.id]);
    setAccounts([...accounts, ...newAccounts]);
    setConnectingBank(null);

    // Update simulation with real net worth
    if (onNetWorthUpdate) {
      onNetWorthUpdate(totalBalance + newAccounts.reduce((sum, a) => sum + a.balance, 0));
    }
  };

  const handleRefresh = (accountId) => {
    setAccounts(accounts.map(a => {
      if (a.id === accountId) {
        return {
          ...a,
          balance: a.balance + (Math.random() - 0.3) * 500,
          lastUpdated: new Date().toISOString(),
        };
      }
      return a;
    }));
  };

  const handleRemoveAccount = (accountId) => {
    setAccounts(accounts.filter(a => a.id !== accountId));
  };

  const handleDisconnectBank = (bankId) => {
    setConnectedBanks(connectedBanks.filter(id => id !== bankId));
    setAccounts(accounts.filter(a => !a.id.startsWith(bankId)));
  };

  // Simulated net worth comparison
  const simulatedNetWorth = simulation?.scenario?.tree?.netWorth || 0;
  const difference = totalBalance - simulatedNetWorth;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 40px rgba(16, 185, 129, 0.5)',
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🏦</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bank Integration</h2>
              <p className="text-slate-400">Track real progress against simulations</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBankSelection(true)}
            className="px-4 py-2 rounded-xl bg-seedling-500 text-white font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Connect Bank
          </motion.button>
        </div>
      </motion.div>

      {/* Overview stats */}
      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {/* Total net worth */}
            <div className="text-center">
              <div className="text-slate-400 text-sm mb-1">Real Net Worth</div>
              <div className="text-3xl font-bold text-seedling-400">
                {formatCurrency(totalBalance, currency)}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                Across {accounts.length} accounts
              </div>
            </div>

            {/* Simulated comparison */}
            <div className="text-center">
              <div className="text-slate-400 text-sm mb-1">Simulated Target</div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(simulatedNetWorth, currency)}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                From current simulation
              </div>
            </div>

            {/* Difference */}
            <div className="text-center">
              <div className="text-slate-400 text-sm mb-1">Difference</div>
              <div className={`text-3xl font-bold ${difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {difference >= 0 ? '+' : ''}{formatCurrency(difference, currency)}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                {difference >= 0 ? 'Ahead of projection' : 'Behind projection'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {simulatedNetWorth > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progress to simulation</span>
                <span className="text-white font-medium">
                  {Math.round((totalBalance / simulatedNetWorth) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    totalBalance >= simulatedNetWorth
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-seedling-500 to-emerald-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalBalance / simulatedNetWorth) * 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Account breakdown by type */}
      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {Object.entries(accountsByType).map(([type, balance]) => (
            <div key={type} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">
                {type === 'checking' && '💵'}
                {type === 'savings' && '🏦'}
                {type === 'investment' && '📈'}
                {type === 'retirement' && '🏖️'}
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(balance, currency)}
              </div>
              <div className="text-slate-400 text-sm capitalize">{type}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Connected banks and accounts */}
      {connectedBanks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {connectedBanks.map((bankId) => {
            const bank = BANKS.find(b => b.id === bankId);
            const bankAccounts = accounts.filter(a => a.id.startsWith(bankId));

            return (
              <div key={bankId} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bank.color} flex items-center justify-center`}>
                      <span className="text-xl">{bank.logo}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold">{bank.name}</div>
                      <div className="text-slate-400 text-sm">
                        {bankAccounts.length} accounts linked
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisconnectBank(bankId)}
                    className="px-3 py-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    Disconnect
                  </motion.button>
                </div>

                <div className="space-y-2">
                  {bankAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      bank={bank}
                      onRefresh={handleRefresh}
                      onRemove={handleRemoveAccount}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <span className="text-6xl block mb-4">🔗</span>
          <h3 className="text-xl font-bold text-white mb-2">No Banks Connected</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Connect your bank accounts to track your real progress against simulated projections and celebrate when you hit milestones early!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBankSelection(true)}
            className="px-6 py-3 rounded-xl bg-seedling-500 text-white font-medium"
          >
            Connect Your First Bank
          </motion.button>
        </motion.div>
      )}

      {/* Security note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-3 text-sm text-slate-500"
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p>
          This is a demonstration of bank integration. In production, this would use Plaid or a similar service with bank-level encryption and security. Your credentials are never stored.
        </p>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showBankSelection && (
          <BankSelectionModal
            isOpen={showBankSelection}
            onClose={() => setShowBankSelection(false)}
            onSelect={handleBankSelect}
            connectedBanks={connectedBanks}
          />
        )}

        {connectingBank && (
          <ConnectionFlowModal
            bank={connectingBank}
            onComplete={handleConnectionComplete}
            onClose={() => setConnectingBank(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BankIntegration;
