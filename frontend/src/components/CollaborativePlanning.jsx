import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Generate random room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Generate random user color
const generateUserColor = () => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// User avatar component
const UserAvatar = ({ user, size = 'md', showStatus = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center font-bold text-white shadow-lg`}
        whileHover={{ scale: 1.1 }}
      >
        {user.name.charAt(0).toUpperCase()}
      </motion.div>
      {showStatus && user.isOnline && (
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Cursor indicator for other users
const UserCursor = ({ user, position }) => (
  <motion.div
    className="absolute pointer-events-none z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, x: position.x, y: position.y }}
    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 3l14 9-7 2-3 7-4-18z"
        className={`fill-current`}
        style={{ color: user.cursorColor }}
      />
    </svg>
    <div className={`mt-1 px-2 py-0.5 rounded text-xs text-white bg-gradient-to-r ${user.color} whitespace-nowrap`}>
      {user.name}
    </div>
  </motion.div>
);

// Parameter slider with user indicators
const CollaborativeSlider = ({ label, value, min, max, step, unit, users, onChange, currentUserId }) => {
  const [localValue, setLocalValue] = useState(value);
  const [editingUsers, setEditingUsers] = useState([]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-800/50 relative">
      {/* Label and value */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-seedling-400 font-bold">
          {unit === '$' ? formatCurrency(localValue, 'USD') : `${localValue}${unit}`}
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
        />

        {/* User position indicators on slider */}
        {users.filter(u => u.id !== currentUserId && u.activeField === label).map((user) => (
          <motion.div
            key={user.id}
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${((user.value - min) / (max - min)) * 100}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${user.color} -translate-x-1/2 border-2 border-white shadow-lg`} />
            <div className={`absolute top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs text-white bg-gradient-to-r ${user.color} whitespace-nowrap`}>
              {user.name}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1 text-xs text-slate-500">
        <span>{unit === '$' ? formatCurrency(min, 'USD') : `${min}${unit}`}</span>
        <span>{unit === '$' ? formatCurrency(max, 'USD') : `${max}${unit}`}</span>
      </div>
    </div>
  );
};

// Chat message component
const ChatMessage = ({ message, isOwn }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
  >
    <UserAvatar user={message.user} size="sm" showStatus={false} />
    <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
      <div className={`px-3 py-2 rounded-xl ${
        isOwn
          ? 'bg-seedling-500 text-white'
          : 'bg-slate-700 text-slate-200'
      }`}>
        {message.text}
      </div>
      <div className="text-xs text-slate-500 mt-1">
        {message.user.name} • {message.timestamp}
      </div>
    </div>
  </motion.div>
);

// Activity feed item
const ActivityItem = ({ activity }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 py-2 text-sm"
  >
    <UserAvatar user={activity.user} size="sm" showStatus={false} />
    <span className="text-slate-400">
      <span className="text-white font-medium">{activity.user.name}</span>
      {' '}{activity.action}
    </span>
  </motion.div>
);

// Main Collaborative Planning Component
const CollaborativePlanning = ({ onSimulationUpdate }) => {
  const { simulation, currency } = useStore();
  const [roomCode, setRoomCode] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [sharedParams, setSharedParams] = useState({
    name: 'Family',
    age: 30,
    income: 75000,
    savings: 50000,
    debt: 10000,
    education: 'bachelors',
    financial_literacy: 0.6,
    monthlyHabitChange: 200,
    generations: 4,
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const chatEndRef = useRef(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create a new room
  const createRoom = () => {
    const code = generateRoomCode();
    const user = {
      id: Date.now().toString(),
      name: 'You',
      color: generateUserColor(),
      cursorColor: '#10b981',
      isOnline: true,
      isHost: true,
    };

    setRoomCode(code);
    setIsHost(true);
    setCurrentUser(user);
    setUsers([user]);

    // Add activity
    setActivities([{
      user,
      action: 'created the room',
      timestamp: new Date().toLocaleTimeString(),
    }]);

    // Simulate other users joining (for demo)
    setTimeout(() => {
      const fakeUser = {
        id: 'fake1',
        name: 'Sarah',
        color: generateUserColor(),
        cursorColor: '#8b5cf6',
        isOnline: true,
        isHost: false,
      };
      setUsers(prev => [...prev, fakeUser]);
      setActivities(prev => [...prev, {
        user: fakeUser,
        action: 'joined the room',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }, 2000);

    setTimeout(() => {
      const fakeUser = {
        id: 'fake2',
        name: 'Marcus',
        color: generateUserColor(),
        cursorColor: '#f59e0b',
        isOnline: true,
        isHost: false,
      };
      setUsers(prev => [...prev, fakeUser]);
      setActivities(prev => [...prev, {
        user: fakeUser,
        action: 'joined the room',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }, 4000);
  };

  // Join an existing room
  const joinRoom = () => {
    if (joinCode.length !== 6) return;

    const user = {
      id: Date.now().toString(),
      name: 'You',
      color: generateUserColor(),
      cursorColor: '#10b981',
      isOnline: true,
      isHost: false,
    };

    setRoomCode(joinCode.toUpperCase());
    setIsHost(false);
    setCurrentUser(user);

    // Simulate existing users in room
    const hostUser = {
      id: 'host',
      name: 'Alex (Host)',
      color: generateUserColor(),
      cursorColor: '#3b82f6',
      isOnline: true,
      isHost: true,
    };

    setUsers([hostUser, user]);
    setActivities([{
      user,
      action: 'joined the room',
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  // Leave room
  const leaveRoom = () => {
    setRoomCode(null);
    setIsHost(false);
    setCurrentUser(null);
    setUsers([]);
    setMessages([]);
    setActivities([]);
    setJoinCode('');
  };

  // Handle parameter change
  const handleParamChange = (param, value) => {
    setSharedParams(prev => ({ ...prev, [param]: value }));

    // Add activity
    if (currentUser) {
      setActivities(prev => [...prev, {
        user: currentUser,
        action: `changed ${param} to ${value}`,
        timestamp: new Date().toLocaleTimeString(),
      }].slice(-10));
    }
  };

  // Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const message = {
      id: Date.now(),
      user: currentUser,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response after a delay
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responder = users.find(u => u.id !== currentUser.id);
        if (responder) {
          const responses = [
            "Good idea! Let's try that.",
            "What if we increase the savings rate too?",
            "I think we should be more conservative.",
            "That looks promising!",
            "Can we run the simulation now?",
          ];
          setMessages(prev => [...prev, {
            id: Date.now(),
            user: responder,
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toLocaleTimeString(),
          }]);
        }
      }, 2000 + Math.random() * 2000);
    }
  };

  // Run collaborative simulation
  const runSimulation = () => {
    setIsSimulating(true);

    if (currentUser) {
      setActivities(prev => [...prev, {
        user: currentUser,
        action: 'started a simulation',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }

    // Trigger simulation
    if (onSimulationUpdate) {
      onSimulationUpdate(sharedParams);
    }

    setTimeout(() => {
      setIsSimulating(false);
      setActivities(prev => [...prev, {
        user: { name: 'System', color: 'from-slate-500 to-slate-600' },
        action: 'simulation completed',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }, 2000);
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  // No room joined state
  if (!roomCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(99, 102, 241, 0.3)',
                '0 0 40px rgba(99, 102, 241, 0.5)',
                '0 0 20px rgba(99, 102, 241, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">👨‍👩‍👧‍👦</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Collaborative Family Planning</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Plan your family's financial future together in real-time. Create a room or join an existing session to collaborate with family members.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Create room */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create Room</h3>
              <p className="text-slate-400 text-sm mb-4">
                Start a new collaborative session and invite family members
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createRoom}
                className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold"
              >
                Create New Room
              </motion.button>
            </div>
          </motion.div>

          {/* Join room */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Join Room</h3>
              <p className="text-slate-400 text-sm mb-4">
                Enter a room code to join an existing session
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ROOM CODE"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white text-center font-mono tracking-widest placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={joinRoom}
                  disabled={joinCode.length !== 6}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                  '0 0 40px rgba(99, 102, 241, 0.5)',
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Family Planning Room</h2>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Room Code:</span>
                <code className="px-2 py-0.5 rounded bg-slate-700 text-seedling-400 font-mono">{roomCode}</code>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyRoomCode}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Online users */}
            <div className="flex -space-x-2">
              {users.slice(0, 4).map((user, i) => (
                <div key={user.id} style={{ zIndex: users.length - i }}>
                  <UserAvatar user={user} size="md" />
                </div>
              ))}
              {users.length > 4 && (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-sm font-medium">
                  +{users.length - 4}
                </div>
              )}
            </div>

            {/* Leave button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={leaveRoom}
              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Leave Room
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main planning area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shared parameters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-seedling-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Shared Parameters
              <span className="text-xs text-slate-500 font-normal ml-2">• All members can adjust</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <CollaborativeSlider
                label="Age"
                value={sharedParams.age}
                min={18}
                max={65}
                step={1}
                unit=" years"
                users={users}
                currentUserId={currentUser?.id}
                onChange={(v) => handleParamChange('age', v)}
              />
              <CollaborativeSlider
                label="Annual Income"
                value={sharedParams.income}
                min={30000}
                max={500000}
                step={5000}
                unit="$"
                users={users}
                currentUserId={currentUser?.id}
                onChange={(v) => handleParamChange('income', v)}
              />
              <CollaborativeSlider
                label="Current Savings"
                value={sharedParams.savings}
                min={0}
                max={500000}
                step={5000}
                unit="$"
                users={users}
                currentUserId={currentUser?.id}
                onChange={(v) => handleParamChange('savings', v)}
              />
              <CollaborativeSlider
                label="Current Debt"
                value={sharedParams.debt}
                min={0}
                max={200000}
                step={5000}
                unit="$"
                users={users}
                currentUserId={currentUser?.id}
                onChange={(v) => handleParamChange('debt', v)}
              />
              <CollaborativeSlider
                label="Monthly Habit Change"
                value={sharedParams.monthlyHabitChange}
                min={50}
                max={1000}
                step={25}
                unit="$"
                users={users}
                currentUserId={currentUser?.id}
                onChange={(v) => handleParamChange('monthlyHabitChange', v)}
              />
              <CollaborativeSlider
                label="Generations"
                value={sharedParams.generations}
                min={2}
                max={6}
                step={1}
                unit=""
                users={users}
                currentUserId={currentUser?.id}
                onChange={(v) => handleParamChange('generations', v)}
              />
            </div>

            {/* Run simulation button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Running Simulation...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Collaborative Simulation
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Simulation preview */}
          {simulation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Latest Results</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 text-center">
                  <div className="text-slate-400 text-sm">Baseline</div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(simulation.baseline?.tree?.netWorth || 0, currency)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-seedling-500/20 text-center border border-seedling-500/30">
                  <div className="text-seedling-400 text-sm">With Changes</div>
                  <div className="text-xl font-bold text-seedling-400">
                    {formatCurrency(simulation.scenario?.tree?.netWorth || 0, currency)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/20 text-center border border-amber-500/30">
                  <div className="text-amber-400 text-sm">Difference</div>
                  <div className="text-xl font-bold text-amber-400">
                    +{formatCurrency(simulation.summary?.difference?.totalNetWorth || 0, currency)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Family Chat
            </h3>

            {/* Messages */}
            <div className="h-64 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No messages yet. Start the discussion!
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isOwn={msg.user.id === currentUser?.id}
                  />
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-500 text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.button>
            </form>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activity
            </h3>

            <div className="max-h-48 overflow-y-auto">
              {activities.slice().reverse().map((activity, i) => (
                <ActivityItem key={i} activity={activity} />
              ))}
            </div>
          </motion.div>

          {/* Participants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Participants ({users.length})
            </h3>

            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1">
                    <div className="text-white font-medium flex items-center gap-2">
                      {user.name}
                      {user.isHost && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Host</span>
                      )}
                    </div>
                    <div className="text-slate-500 text-sm">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativePlanning;
