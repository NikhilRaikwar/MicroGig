import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Task, assignTask, completeTask } from "@/lib/tasks";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Clock, Tag, User, Briefcase, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { TxResultDialog } from "./TxResultDialog";

interface TaskCardProps {
  task: Task;
  publicKey: string | null;
  onUpdate: (task: Task) => void;
  index: number;
  onPaymentSuccess?: () => void;
}

const TaskCard = ({ task, publicKey, onUpdate, index, onPaymentSuccess }: TaskCardProps) => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);

  const isCreator = publicKey === task.posterAddress;
  const isAssignedToMe = publicKey === task.workerAddress;
  const isDeadlinePassed = task.deadline ? Date.now() > task.deadline : false;

  const handleClaim = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setProcessing(true);
    try {
      const updated = assignTask(task.id, publicKey);
      if (updated) {
        onUpdate(updated);
        toast.success("Task claimed successfully!");
      }
    } catch (error) {
      toast.error("Failed to claim task");
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!publicKey || !task.workerAddress) return;

    setProcessing(true);
    try {
      const { sendPayment } = await import("@/lib/stellar");
      toast.info("Processing payment...", { description: "Please sign in your wallet" });

      const result = await sendPayment(task.workerAddress, task.reward.toString());

      if (result) {
        const updated = completeTask(task.id, result.hash); // Store hash
        if (updated) {
          onUpdate(updated);
          if (onPaymentSuccess) onPaymentSuccess();
          setTxResult(result);
          setShowResult(true);
          toast.success("Payment Successful! 👑", { description: "Worker paid and verified on-chain." });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const statusColor =
    task.status === "open"
      ? "text-green-500 bg-green-500/10 border-green-500/20"
      : task.status === "assigned"
        ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
        : "text-purple-500 bg-purple-500/10 border-purple-500/20";

  const handleCardClick = (e: React.MouseEvent) => {
    // If identifying a click on a button or link, don't navigate
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(`/gig/${task.id}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        onClick={handleCardClick}
        className="group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className={`px-2.5 py-1 rounded-md text-xs font-mono border ${statusColor}`}>
              {task.status.toUpperCase()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground font-mono">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </div>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="inline-flex items-center text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <Tag className="w-3 h-3 mr-1" />
              {task.category}
            </div>
            <div className="inline-flex items-center text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md" title={task.posterAddress}>
              <User className="w-3 h-3 mr-1" />
              Creator: {task.posterAddress.slice(0, 4)}...{task.posterAddress.slice(-4)}
            </div>
            {task.status === "completed" && (
              <div className="inline-flex items-center text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-md border border-purple-200">
                Winner 👑
              </div>
            )}
          </div>
        </div>

        {/* Action Area */}
        <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">{task.reward} <span className="text-sm font-normal text-muted-foreground">XLM</span></div>
          </div>

          {isCreator ? (
            task.status === "open" ? (
              <span className="text-xs font-mono text-muted-foreground">
                <Link to={`/gig/${task.id}`} className="hover:underline">View Details</Link>
              </span>
            ) : task.status === "assigned" ? (
              <Link to={`/gig/${task.id}`}>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  Pay Winner 👑
                </Button>
              </Link>
            ) : (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${task.transactionHash || ""}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                View Payment <ExternalLink className="w-3 h-3" />
              </a>
            )
          ) : (
            task.status === "open" ? (
              isDeadlinePassed ? (
                <Button disabled variant="secondary" className="opacity-50 cursor-not-allowed">
                  Deadline Passed ⏰
                </Button>
              ) : (
                <Link to={`/gig/${task.id}`}>
                  <Button variant="secondary" className="hover:bg-accent hover:text-accent-foreground">
                    View & Claim 🙋‍♂️
                  </Button>
                </Link>
              )
            ) : task.status === "assigned" && task.workerAddress === publicKey ? (
              <Link to={`/gig/${task.id}`}>
                <div className="text-xs font-mono text-yellow-500 animate-pulse hover:underline">Submit Work...</div>
              </Link>
            ) : task.status === "completed" ? (
              <Link to={`/gig/${task.id}`} className="hover:opacity-80 transition-opacity">
                <span className="text-xs font-mono text-green-600 flex items-center gap-1 hover:underline">
                  Completed <CheckCircle2 className="w-3 h-3" /> (View)
                </span>
              </Link>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">Closed</span>
            )
          )}
        </div>
      </motion.div>

      <TxResultDialog
        result={txResult}
        open={showResult}
        onClose={() => setShowResult(false)}
      />
    </>
  );
};

export default TaskCard;
