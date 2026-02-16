import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle } from "lucide-react";
import { truncateAddress } from "@/lib/stellar";

interface TxResultDialogProps {
  result: any;
  open: boolean;
  onClose: () => void;
}

export function TxResultDialog({ result, open, onClose }: TxResultDialogProps) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-5 h-5" />
            Payment Successful! 👑
          </DialogTitle>
          <DialogDescription>
            The winner has been paid and the transaction is confirmed on-chain.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-sm text-muted-foreground">Tx Hash:</span>
            <code className="col-span-3 text-xs font-mono bg-muted p-1 rounded break-all">
              {result.hash}
            </code>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-sm text-muted-foreground">Ledger:</span>
            <span className="col-span-3 text-sm font-mono text-foreground">
              {result.ledger || "Confirmed"}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button type="button" variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10">
              View on Explorer <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
