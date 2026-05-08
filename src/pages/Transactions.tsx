import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus, ArrowRight, Search, Filter, LogIn } from "lucide-react";
import { toast } from "sonner";

const PROPERTY_TYPES = [
  { value: "freehold", label: "Freehold" },
  { value: "leasehold", label: "Leasehold" },
  { value: "share_of_freehold", label: "Share of Freehold" },
  { value: "commonhold", label: "Commonhold" },
];

export default function Transactions() {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const utils = trpc.useUtils();
  const { data: transactions, isLoading } = trpc.transaction.list.useQuery();

  const createTx = trpc.transaction.create.useMutation({
    onSuccess: () => { utils.transaction.list.invalidate(); setOpen(false); setTxType(""); setPropertyType(""); toast.success("Transaction created"); },
    onError: (err) => toast.error(err.message || "Failed to create transaction"),
  });

  const createProperty = trpc.property.create.useMutation({
    onError: () => {},
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to create a transaction");
      return;
    }
    const f = new FormData(e.currentTarget);
    if (!txType) { toast.error("Please select a transaction type"); return; }
    if (!propertyType) { toast.error("Please select a property type"); return; }

    const title = f.get("title") as string;
    const address = f.get("address") as string;
    const postcode = f.get("postcode") as string;

    // Auto-create a property with the selected type
    let newPropertyId: number;
    try {
      const result = await createProperty.mutateAsync({
        address: address || title,
        postcode: postcode || "TBC",
        propertyType: propertyType as "freehold" | "leasehold" | "share_of_freehold" | "commonhold",
        price: f.get("agreedPrice") as string,
      });
      newPropertyId = result.insertId || 1;
    } catch {
      newPropertyId = 1;
    }

    createTx.mutate({
      reference: `TX-${Date.now()}`,
      title,
      type: txType as "purchase" | "sale" | "remortgage" | "transfer",
      propertyId: newPropertyId,
      clientId: user.id,
      agreedPrice: f.get("agreedPrice") as string,
      depositAmount: (f.get("depositAmount") as string) || undefined,
      mortgageLender: (f.get("mortgageLender") as string) || undefined,
    });
  };

  const filtered = transactions?.filter(tx => {
    if (filter === "active") return tx.status !== "archived" && tx.status !== "completion";
    if (filter === "completed") return tx.status === "completion";
    if (filter === "archived") return tx.status === "archived";
    return true;
  }).filter(tx => !search || tx.title.toLowerCase().includes(search.toLowerCase()) || tx.reference.toLowerCase().includes(search.toLowerCase()));

  const statusLabels: Record<string, string> = {
    draft: "Draft", instruction: "Instruction", searches: "Searches", enquiries: "Enquiries",
    contracts: "Contracts", exchange: "Exchange", completion: "Completed", archived: "Archived",
  };
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700", instruction: "bg-blue-100 text-blue-700",
    searches: "bg-amber-100 text-amber-700", enquiries: "bg-amber-100 text-amber-700",
    contracts: "bg-purple-100 text-purple-700", exchange: "bg-indigo-100 text-indigo-700",
    completion: "bg-emerald-100 text-emerald-700", archived: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Transactions</h1><p className="text-gray-500 mt-1">Manage all your property transactions</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> New Transaction</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Transaction</DialogTitle></DialogHeader>
            {!isAuthenticated ? (
              <div className="text-center py-6 space-y-4">
                <LogIn className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-gray-500">Please sign in to create a transaction</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = "/api/demo-login"}>
                  <Plus className="w-4 h-4 mr-2" /> Try Demo Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label htmlFor="tx-title">Title *</Label><Input id="tx-title" name="title" required placeholder="e.g., 123 High Street Purchase" /></div>
                <div><Label htmlFor="tx-address">Property Address *</Label><Input id="tx-address" name="address" required placeholder="123 High Street, London" /></div>
                <div><Label htmlFor="tx-postcode">Postcode</Label><Input id="tx-postcode" name="postcode" placeholder="SW1A 1AA" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="tx-type">Transaction Type *</Label>
                    <Select value={txType} onValueChange={setTxType}>
                      <SelectTrigger id="tx-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="remortgage">Remortgage</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="tx-ptype">Property Type *</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger id="tx-ptype"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label htmlFor="tx-price">Agreed Price (&pound;) *</Label><Input id="tx-price" name="agreedPrice" type="number" required placeholder="450000" /></div>
                <div><Label htmlFor="tx-deposit">Deposit (&pound;)</Label><Input id="tx-deposit" name="depositAmount" type="number" placeholder="45000" /></div>
                <div><Label htmlFor="tx-lender">Mortgage Lender</Label><Input id="tx-lender" name="mortgageLender" placeholder="e.g., Halifax" /></div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={createTx.isPending}>
                  {createTx.isPending ? "Creating..." : "Create Transaction"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search transactions..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-gray-400" />
          <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
          </Select></div>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4 animate-pulse"><div className="h-10 w-10 rounded-lg bg-gray-200" /><div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div></div>)}</div>
        ) : !filtered?.length ? (
          <div className="text-center py-12"><FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No transactions found</p>
            <Button variant="link" className="text-emerald-600" onClick={() => setOpen(true)}>Create your first transaction</Button></div>
        ) : (
          <div className="divide-y">
            {filtered.map(tx => (
              <Link key={tx.id} to={`/transactions/${tx.id}`} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-gray-900 truncate">{tx.title}</h3><Badge className={statusColors[tx.status] || "bg-gray-100 text-gray-700"}>{statusLabels[tx.status] || tx.status}</Badge></div>
                    <p className="text-sm text-gray-500">{tx.reference} &middot; {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}{tx.mortgageLender && ` &middot; ${tx.mortgageLender}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4"><span className="text-lg font-semibold text-gray-900 hidden sm:block">&pound;{Number(tx.agreedPrice).toLocaleString()}</span><ArrowRight className="w-4 h-4 text-gray-400" /></div>
              </Link>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
