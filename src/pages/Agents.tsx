import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  Bot, 
  Terminal, 
  Zap, 
  Activity, 
  Search, 
  Cpu, 
  ShieldCheck, 
  Smartphone,
  Eye,
  Settings
} from "lucide-react";
import { CATEGORIES } from "@/lib/tasks";

interface AgentMetric {
  name: string;
  value: string | number;
  change: string;
  status: "active" | "idle" | "busy";
}

const Agents = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [activeTab, setActiveTab] = useState<"observe" | "configure">("observe");
  const [agentLogs, setAgentLogs] = useState<string[]>([
    "Initializing Agent Arena v2.6...",
    "Connecting to Soroban RPC (Testnet)...",
    "Loading GigRegistry CA2MV2V... events.",
    "Monitoring Creator Agent pulse...",
  ]);

  useEffect(() => {
    import("@/lib/stellar").then(({ getPersistedAddress, fetchBalance }) => {
      const saved = getPersistedAddress();
      if (saved) {
        setPublicKey(saved);
        fetchBalance(saved).then(setBalance);
      }
    });

    const interval = setInterval(() => {
      const events = [
        `Indexing new submission for Gig #${Math.floor(Math.random() * 10)}`,
        "AI Evaluator: Scoring submission quality (Confidence: 94%)",
        "Market Pulse: Volume increased by 0.5 XLM",
        "Agent Sync: 100% On-Chain Parity reached.",
      ];
      setAgentLogs(prev => [events[Math.floor(Math.random() * events.length)], ...prev].slice(0, 50));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const metrics: AgentMetric[] = [
    { name: "Market Efficiency", value: "98.2%", change: "+1.2%", status: "active" },
    { name: "Avg. AI Score", value: "8.9/10", change: "-0.2%", status: "active" },
    { name: "Daily Deployments", value: "42", change: "+5", status: "active" },
    { name: "Active Agents", value: "3", change: "Stable", status: "idle" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar 
        publicKey={publicKey} 
        balance={balance} 
        onConnect={setPublicKey} 
        onDisconnect={() => setPublicKey(null)} 
        onRefreshBalance={() => {}}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: Agent Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-6 h-6 text-primary" />
                <h3 className="font-mono font-bold tracking-tight">AGENT ARENA</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Master Agent</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <h4 className="font-mono text-sm font-bold text-white mb-1">MicroGig Robot</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Orchestrates UI/TG sync and on-chain bounty architectures.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">AI Evaluator</span>
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  </div>
                  <h4 className="font-mono text-sm font-bold text-white mb-1">Scoring Subagent</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Automated solution scoring via GPT-4o embeddings.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono font-bold text-primary">MOBILE GATEWAY</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-4">
                    Manage your bounties, check balances, and fund your wallet directly from your phone.
                  </p>
                  <a 
                    href="https://t.me/microgig_bot" 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full text-center py-3 rounded-xl bg-[#229ED9] text-white font-mono font-bold hover:bg-[#1c84b5] transition-all text-xs"
                  >
                    OPEN BOT ASSISTANT
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {metrics.slice(0, 2).map((m) => (
                <div key={m.name} className="p-4 rounded-xl bg-secondary/20 border border-white/5">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{m.name}</p>
                  <p className="text-lg font-mono font-bold">{m.value}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT: The Core Dashboard */}
          <main className="flex-1 space-y-6">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between bg-secondary/20 p-2 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActiveTab("observe")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${activeTab === "observe" ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  OBSERVE
                </button>
                <button 
                  onClick={() => setActiveTab("configure")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${activeTab === "configure" ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  CONFIGURE
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-4 px-4 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-green-500" /> SYSTEM HEALTH</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-yellow-500" /> 14ms LATENCY</span>
              </div>
            </div>

            {/* Metric Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl bg-secondary/10 border border-white/5 group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                      <Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className={`text-[10px] font-mono ${m.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {m.change}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">{m.name}</p>
                  <p className="text-2xl font-mono font-bold tracking-tighter mt-1">{m.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Terminal Feed */}
            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[500px]">
              <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono font-bold tracking-tight uppercase">Agent Operation Feed</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">LIVE_STREAM_v0.9</span>
              </div>
              
              <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto space-y-2 custom-scrollbar scroll-smooth">
                {agentLogs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 text-muted-foreground"
                  >
                    <span className="text-primary/40 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className="text-primary/60 shrink-0">::</span>
                    <span className={i === 0 ? "text-white font-bold" : "text-muted-foreground/80"}>{log}</span>
                  </motion.div>
                ))}
              </div>

              {/* Input Placeholder */}
              <div className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-4">
                <span className="text-primary font-mono text-sm ml-2">&gt;</span>
                <input 
                  type="text" 
                  readOnly 
                  placeholder="Agents are operating in autonomous mode..." 
                  className="bg-transparent border-none outline-none text-xs font-mono text-muted-foreground w-full italic"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Agents;
