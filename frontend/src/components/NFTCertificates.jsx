import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Certificate types based on achievements
const CERTIFICATE_TYPES = [
  {
    id: 'first_seed',
    name: 'First Seed Planted',
    description: 'Completed your first wealth simulation',
    icon: '🌱',
    rarity: 'common',
    color: 'from-green-500 to-emerald-600',
    requirement: { type: 'simulations', value: 1 },
  },
  {
    id: 'ten_thousand',
    name: '$10K Milestone',
    description: 'Simulated reaching $10,000 net worth',
    icon: '🌿',
    rarity: 'common',
    color: 'from-emerald-500 to-teal-600',
    requirement: { type: 'networth', value: 10000 },
  },
  {
    id: 'hundred_thousand',
    name: 'Six Figure Club',
    description: 'Simulated reaching $100,000 net worth',
    icon: '🌳',
    rarity: 'uncommon',
    color: 'from-blue-500 to-cyan-600',
    requirement: { type: 'networth', value: 100000 },
  },
  {
    id: 'millionaire',
    name: 'Millionaire Status',
    description: 'Simulated reaching $1,000,000 net worth',
    icon: '🏆',
    rarity: 'rare',
    color: 'from-amber-500 to-orange-600',
    requirement: { type: 'networth', value: 1000000 },
  },
  {
    id: 'multi_millionaire',
    name: 'Multi-Millionaire',
    description: 'Simulated reaching $5,000,000 net worth',
    icon: '💎',
    rarity: 'epic',
    color: 'from-purple-500 to-pink-600',
    requirement: { type: 'networth', value: 5000000 },
  },
  {
    id: 'generational',
    name: 'Generational Wealth',
    description: 'Simulated reaching $10,000,000+ across generations',
    icon: '👑',
    rarity: 'legendary',
    color: 'from-yellow-500 to-amber-600',
    requirement: { type: 'networth', value: 10000000 },
  },
  {
    id: 'four_generations',
    name: 'Four Generations Deep',
    description: 'Simulated 4+ generations of wealth building',
    icon: '🌲',
    rarity: 'uncommon',
    color: 'from-teal-500 to-cyan-600',
    requirement: { type: 'generations', value: 4 },
  },
  {
    id: 'habit_master',
    name: 'Habit Master',
    description: 'Simulated $500+/month in habit savings',
    icon: '⚡',
    rarity: 'rare',
    color: 'from-indigo-500 to-purple-600',
    requirement: { type: 'habits', value: 500 },
  },
];

// Rarity colors and labels
const RARITY_CONFIG = {
  common: { label: 'Common', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
  uncommon: { label: 'Uncommon', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  rare: { label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  epic: { label: 'Epic', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  legendary: { label: 'Legendary', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
};

// Generate unique certificate ID
const generateCertificateId = () => {
  return `SEED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

// Certificate preview component
const CertificatePreview = ({ certificate, mintData, isPreview = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 400;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Inner border glow
    ctx.strokeStyle = certificate.color.includes('amber') ? '#f59e0b44' :
                      certificate.color.includes('purple') ? '#a855f744' :
                      certificate.color.includes('blue') ? '#3b82f644' : '#10b98144';
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SEEDLING', width / 2, 60);

    ctx.font = '14px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('LEGACY CERTIFICATE', width / 2, 82);

    // Icon circle
    ctx.beginPath();
    ctx.arc(width / 2, 160, 50, 0, Math.PI * 2);
    const iconGradient = ctx.createRadialGradient(width / 2, 160, 0, width / 2, 160, 50);
    iconGradient.addColorStop(0, '#1e293b');
    iconGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = iconGradient;
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Certificate name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui';
    ctx.fillText(certificate.name, width / 2, 250);

    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui';
    const words = certificate.description.split(' ');
    let line = '';
    let y = 280;
    for (let word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > width - 60) {
        ctx.fillText(line.trim(), width / 2, y);
        line = word + ' ';
        y += 18;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, y);

    // Rarity badge
    const rarity = RARITY_CONFIG[certificate.rarity];
    ctx.fillStyle = rarity.color.replace('text-', '#').replace('-400', '');
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(rarity.label.toUpperCase(), width / 2, 330);

    // Divider
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 350);
    ctx.lineTo(width - 50, 350);
    ctx.stroke();

    // Mint data
    if (mintData) {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`ID: ${mintData.id}`, width / 2, 380);
      ctx.fillText(`Minted: ${new Date(mintData.timestamp).toLocaleDateString()}`, width / 2, 400);
      ctx.fillText(`Owner: ${mintData.owner || 'seedling.user'}`, width / 2, 420);
    }

    // Footer
    ctx.fillStyle = '#475569';
    ctx.font = '10px system-ui';
    ctx.fillText('Verified on Seedling Network', width / 2, 470);
  }, [certificate, mintData]);

  return (
    <div className={`relative ${isPreview ? 'opacity-80' : ''}`}>
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-2xl"
        style={{ width: 300, height: 375 }}
      />
      {/* Icon overlay (emoji can't be drawn on canvas easily) */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ top: '18%' }}>
        <span className="text-5xl">{certificate.icon}</span>
      </div>
      {isPreview && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <span className="text-white font-medium">Preview</span>
        </div>
      )}
    </div>
  );
};

// Certificate card component
const CertificateCard = ({ certificate, isUnlocked, isMinted, mintData, onMint, onView }) => {
  const rarity = RARITY_CONFIG[certificate.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
      className={`relative p-6 rounded-2xl border overflow-hidden transition-all ${
        isMinted
          ? `${rarity.bg} ${rarity.border}`
          : isUnlocked
          ? 'bg-slate-800/50 border-seedling-500/50'
          : 'bg-slate-800/30 border-slate-700/30 opacity-50'
      }`}
    >
      {/* Shine effect for minted */}
      {isMinted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: [-300, 300] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${certificate.color} flex items-center justify-center`}>
            <span className="text-3xl">{certificate.icon}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${rarity.bg} ${rarity.color}`}>
            {rarity.label}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-white font-bold text-lg mb-1">{certificate.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{certificate.description}</p>

        {/* Status */}
        {isMinted ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-seedling-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Minted on {new Date(mintData.timestamp).toLocaleDateString()}
            </div>
            <code className="block text-xs text-slate-500 font-mono truncate">{mintData.id}</code>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView(certificate, mintData)}
              className="w-full py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:text-white transition-colors text-sm"
            >
              View Certificate
            </motion.button>
          </div>
        ) : isUnlocked ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMint(certificate)}
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${certificate.color} text-white font-medium`}
          >
            Mint Certificate
          </motion.button>
        ) : (
          <div className="text-center py-2">
            <span className="text-slate-500 text-sm">🔒 Locked</span>
            <p className="text-slate-600 text-xs mt-1">
              {certificate.requirement.type === 'networth' && `Reach ${formatCurrency(certificate.requirement.value, 'USD')} to unlock`}
              {certificate.requirement.type === 'generations' && `Simulate ${certificate.requirement.value}+ generations`}
              {certificate.requirement.type === 'simulations' && `Complete ${certificate.requirement.value} simulation(s)`}
              {certificate.requirement.type === 'habits' && `Save ${formatCurrency(certificate.requirement.value, 'USD')}/month in habits`}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Minting modal
const MintingModal = ({ certificate, onConfirm, onClose }) => {
  const [step, setStep] = useState('confirm');
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);
    setStep('minting');

    // Simulate minting delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    setStep('complete');
    setIsMinting(false);

    setTimeout(() => {
      onConfirm();
    }, 2000);
  };

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
        className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${certificate.color} flex items-center justify-center`}>
                <span className="text-4xl">{certificate.icon}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Mint Certificate</h2>
              <p className="text-slate-400 mb-6">{certificate.name}</p>

              <div className="p-4 rounded-xl bg-slate-800/50 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Rarity</span>
                  <span className={RARITY_CONFIG[certificate.rarity].color}>
                    {RARITY_CONFIG[certificate.rarity].label}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Network</span>
                  <span className="text-white">Seedling Network</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Gas Fee</span>
                  <span className="text-seedling-400">Free</span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMint}
                  className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${certificate.color} text-white font-medium`}
                >
                  Mint Now
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'minting' && (
            <motion.div
              key="minting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${certificate.color} flex items-center justify-center`}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-4xl">{certificate.icon}</span>
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Minting Certificate...</h2>
              <p className="text-slate-400">Please wait while we create your NFT</p>
              <div className="mt-6 flex justify-center">
                <motion.div
                  className="w-8 h-8 border-2 border-seedling-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Certificate Minted!</h2>
              <p className="text-slate-400">Your achievement is now on the blockchain</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// View certificate modal
const ViewCertificateModal = ({ certificate, mintData, onClose }) => {
  const handleDownload = () => {
    // In production, this would download the actual NFT image
    alert('Certificate downloaded! (Demo)');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Seedling: ${certificate.name}`,
        text: `I just minted "${certificate.name}" on Seedling! ${certificate.description}`,
        url: window.location.href,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Your Certificate</h2>
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

        <div className="flex justify-center mb-6">
          <CertificatePreview certificate={certificate} mintData={mintData} isPreview={false} />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${certificate.color} text-white font-medium flex items-center justify-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main NFT Certificates Component
const NFTCertificates = () => {
  const { simulation, currency } = useStore();
  const [mintedCertificates, setMintedCertificates] = useState({});
  const [mintingCertificate, setMintingCertificate] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Load minted certificates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seedling_nft_certificates');
    if (saved) {
      setMintedCertificates(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('seedling_nft_certificates', JSON.stringify(mintedCertificates));
  }, [mintedCertificates]);

  const netWorth = simulation?.scenario?.tree?.netWorth || 0;
  const generations = 4; // From simulation
  const monthlyHabits = 200; // From simulation
  const totalSimulations = 1; // Track this

  // Check if certificate is unlocked
  const isCertificateUnlocked = (cert) => {
    switch (cert.requirement.type) {
      case 'networth':
        return netWorth >= cert.requirement.value;
      case 'generations':
        return generations >= cert.requirement.value;
      case 'simulations':
        return totalSimulations >= cert.requirement.value;
      case 'habits':
        return monthlyHabits >= cert.requirement.value;
      default:
        return false;
    }
  };

  // Handle minting
  const handleMint = (certificate) => {
    setMintingCertificate(certificate);
  };

  const handleMintConfirm = () => {
    const mintData = {
      id: generateCertificateId(),
      timestamp: new Date().toISOString(),
      owner: 'seedling.user',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    };

    setMintedCertificates({
      ...mintedCertificates,
      [mintingCertificate.id]: mintData,
    });
    setMintingCertificate(null);
  };

  // Handle viewing
  const handleView = (certificate, mintData) => {
    setViewingCertificate({ certificate, mintData });
  };

  // Stats
  const unlockedCount = CERTIFICATE_TYPES.filter(isCertificateUnlocked).length;
  const mintedCount = Object.keys(mintedCertificates).length;

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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(236, 72, 153, 0.3)',
                  '0 0 40px rgba(236, 72, 153, 0.5)',
                  '0 0 20px rgba(236, 72, 153, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🎖️</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">NFT Legacy Certificates</h2>
              <p className="text-slate-400">Mint your achievements on the blockchain</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-seedling-400">{mintedCount}/{CERTIFICATE_TYPES.length}</div>
            <div className="text-slate-400 text-sm">Minted</div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white">{CERTIFICATE_TYPES.length}</div>
          <div className="text-slate-400 text-sm">Total Certificates</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-seedling-400">{unlockedCount}</div>
          <div className="text-slate-400 text-sm">Unlocked</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{mintedCount}</div>
          <div className="text-slate-400 text-sm">Minted</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">
            {CERTIFICATE_TYPES.filter(c => c.rarity === 'legendary' && mintedCertificates[c.id]).length}
          </div>
          <div className="text-slate-400 text-sm">Legendary</div>
        </div>
      </motion.div>

      {/* Certificates grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {CERTIFICATE_TYPES.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            isUnlocked={isCertificateUnlocked(cert)}
            isMinted={!!mintedCertificates[cert.id]}
            mintData={mintedCertificates[cert.id]}
            onMint={handleMint}
            onView={handleView}
          />
        ))}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 text-sm text-slate-500"
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          NFT certificates are stored locally in this demo. In production, these would be minted on a blockchain
          like Ethereum, Polygon, or Solana, providing verifiable proof of your financial discipline achievements.
        </p>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {mintingCertificate && (
          <MintingModal
            certificate={mintingCertificate}
            onConfirm={handleMintConfirm}
            onClose={() => setMintingCertificate(null)}
          />
        )}

        {viewingCertificate && (
          <ViewCertificateModal
            certificate={viewingCertificate.certificate}
            mintData={viewingCertificate.mintData}
            onClose={() => setViewingCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NFTCertificates;
