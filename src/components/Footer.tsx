import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Swords,
  Twitter,
  MessageCircle,
  Github,
  Globe,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const footerLinks = {
  game: [
    { name: 'Play Now', href: '#play' },
    { name: 'Mint Pieces', href: '#mint' },
    { name: 'Leaderboard', href: '#leaderboard' },
    { name: 'How It Works', href: '#how' },
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Smart Contracts', href: 'https://sepolia.etherscan.io', external: true },
    { name: 'OpenSea', href: 'https://testnets.opensea.io', external: true },
    { name: 'FAQ', href: '#' },
  ],
  community: [
    { name: 'Discord', href: '#' },
    { name: 'Twitter', href: '#' },
    { name: 'Telegram', href: '#' },
    { name: 'Blog', href: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Globe, href: '#', label: 'Website' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative pt-24 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-background to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">Stay in the Game</h3>
              <p className="text-gray-400">Get updates on tournaments, new features, and exclusive drops.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-6 py-4 bg-surface border border-white/10 rounded-l-xl focus:outline-none focus:border-primary transition-colors"
              />
              <motion.button
                className="px-6 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-r-xl font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Swords className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl tracking-wider">BATTLE CHESS</h1>
                <p className="text-xs text-gray-400 tracking-widest">SEPOLIA TESTNET</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              The ultimate Web3 chess experience. Own your pieces as ERC-721 NFTs, stake your army, and battle for glory.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2025 Battle Chess NFT. Built on Sepolia Testnet.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a 
              href="https://sepolia.etherscan.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
