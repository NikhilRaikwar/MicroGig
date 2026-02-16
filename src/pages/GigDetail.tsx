import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChainGigs, submitWorkOnChain, pickWinnerOnChain } from "@/lib/contract";
import { Task } from "@/lib/tasks";
import { startTransition } from "react";
import { kit } from "@/lib/stellar-wallets-kit";
import { sendPayment } from "@/lib/stellar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Clock, Link as LinkIcon, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

const getWalletAddress = async (): Promise<string | null> => {
    try {
        const result: any = await kit.getAddress();
        if (result.address) return result.address;
        if (typeof result === 'string') return result;
        return null;
    } catch {
        return null;
    }
};

const GigDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    // Actions
    const [submitting, setSubmitting] = useState(false);
    const [submissionLink, setSubmissionLink] = useState("");
    const [pickingWinner, setPickingWinner] = useState(false);

    useEffect(() => {
        const load = async () => {
            const addr = await getWalletAddress();
            setPublicKey(addr);
            await refreshTask();
        };
        load();
    }, [id]);

    const refreshTask = async () => {
        setLoading(true);
        const gigs = await getChainGigs();
        const found = gigs.find((g: any) => g.id === id);
        if (found) setTask(found);
        setLoading(false);
    };

    const handleSubmitWork = async () => {
        if (!publicKey) { toast.error("Connect wallet first!"); return; }
        if (!submissionLink) { toast.error("Enter a link!"); return; }

        setSubmitting(true);
        try {
            await submitWorkOnChain(task!.id, publicKey, submissionLink);
            toast.success("Work Submitted! 🚀");
            setSubmissionLink("");
            await refreshTask();
        } catch (e: any) {
            toast.error("Submission failed: " + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePickWinner = async (worker: string) => {
        if (!publicKey) return;
        setPickingWinner(true);
        try {
            toast.info("Step 1: Sending Reward...");
            const payResult = await sendPayment(worker, task!.reward.toString());

            if (!payResult.success || !payResult.hash) {
                toast.error("Payment Failed! " + payResult.error);
                return;
            }

            toast.success("Payment Sent! Step 2: Confirming on Chain...");

            // Pass the Payment Hash to the Contract!
            await pickWinnerOnChain(task!.id, worker, publicKey, payResult.hash);

            toast.success("Gig Closed & Receipt Stored! 👑");
            await refreshTask();
        } catch (e: any) {
            toast.error("Process failed: " + e.message);
        } finally {
            setPickingWinner(false);
        }
    };

    if (loading && !task) return <div className="p-10 text-center animate-pulse">Loading Chain Data...</div>;
    if (!task) return <div className="p-10 text-center">Gig not found.</div>;

    const isCreator = publicKey === task.posterAddress;
    const isWinner = task.status === 'completed' && task.workerAddress === publicKey;
    const mySubmission = task.submissions?.find(s => s.worker === publicKey);

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Button variant="ghost" className="mb-6 hover:bg-secondary/50" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-48 h-48" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${task.status === 'open' ? 'border-green-500/50 text-green-500 bg-green-500/10' :
                                    'border-purple-500/50 text-purple-500 bg-purple-500/10'
                                    }`}>
                                    {task.status === 'open' ? 'OPEN FOR SUBMISSIONS' : 'COMPLETED'}
                                </span>
                                <span className="text-muted-foreground text-xs font-mono">ID: #{task.id}</span>
                            </div>

                            <h1 className="text-4xl font-bold font-mono tracking-tight mb-4">{task.title}</h1>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                                        {task.posterAddress.slice(0, 2)}
                                    </div>
                                    <span>by {task.posterAddress.slice(0, 4)}...{task.posterAddress.slice(-4)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{task.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Submissions List */}
                    <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <LinkIcon className="w-5 h-5" /> Submissions ({task.submissions?.length || 0})
                            </h3>
                            {task.status === 'open' && isCreator && (
                                <span className="text-xs text-green-500 animate-pulse">Pick a winner to close the bounty</span>
                            )}
                        </div>

                        <div className="space-y-4">
                            {task.submissions && task.submissions.length > 0 ? (
                                task.submissions.map((sub, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${task.workerAddress === sub.worker ? 'border-yellow-500 bg-yellow-500/10' : 'border-border bg-secondary/20'
                                        } flex flex-col sm:flex-row justify-between gap-4 transition-all hover:bg-secondary/40 items-center`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm font-bold text-primary">
                                                    {sub.worker.slice(0, 4)}...{sub.worker.slice(-4)}
                                                </span>
                                                {sub.worker === publicKey && <span className="text-xs bg-primary/20 text-primary px-2 rounded">YOU</span>}
                                                {task.workerAddress === sub.worker && (
                                                    <span className="flex items-center gap-1 text-xs bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">
                                                        <Trophy className="w-3 h-3" /> WINNER
                                                    </span>
                                                )}
                                            </div>
                                            <a href={sub.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm break-all">
                                                {sub.link}
                                            </a>
                                        </div>

                                        {isCreator && task.status === 'open' && (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                                onClick={() => handlePickWinner(sub.worker)}
                                                disabled={pickingWinner}
                                            >
                                                {pickingWinner ? "Picking..." : "Select Winner 🏆"}
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                                    No submissions yet. Be the first!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Action Box */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-lg lg:sticky lg:top-6">
                        <div className="flex justify-between items-baseline mb-2">
                            <div className="text-sm font-medium text-muted-foreground">BOUNTY REWARD</div>
                        </div>
                        <div className="text-4xl font-bold text-accent mb-6">{task.reward} XLM</div>

                        {task.status === 'open' ? (
                            isCreator ? (
                                <div className="p-4 bg-secondary/50 rounded-lg text-center text-sm border border-border">
                                    Compare submissions and pick a winner to distribute the reward.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {mySubmission ? (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
                                            <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                                            You have submitted work!
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Submit your solution</label>
                                            <Input
                                                placeholder="https://github.com/..."
                                                value={submissionLink}
                                                onChange={(e) => setSubmissionLink(e.target.value)}
                                                className="bg-secondary/50"
                                            />
                                            <Button
                                                className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20"
                                                onClick={handleSubmitWork}
                                                disabled={submitting}
                                            >
                                                {submitting ? "Submitting..." : "Submit Work 🚀"}
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center">
                                                Submitting requires a small network fee.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                                <Trophy className="w-12 h-12 mx-auto text-purple-500 mb-3" />
                                <h3 className="font-bold text-purple-400 mb-1">Gig Completed & Paid</h3>
                                <div className="text-sm text-purple-300/80 space-y-2">
                                    <p>Winner: <span className="font-mono text-white bg-black/20 px-2 py-0.5 rounded">{task.workerAddress?.slice(0, 6)}...{task.workerAddress?.slice(-4)}</span></p>
                                    <a
                                        href={`https://stellar.expert/explorer/testnet/tx/${task.transactionHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 underline mt-2"
                                    >
                                        View Payment Receipt <LinkIcon className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigDetail;
