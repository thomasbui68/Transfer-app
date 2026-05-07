import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, Users, CheckCircle2, Circle, Clock, AlertTriangle, PoundSterling } from "lucide-react";

const statusLabels: Record<string, string> = { draft: "Draft", instruction: "Instruction", searches: "Searches", enquiries: "Enquiries", contracts: "Contracts", exchange: "Exchange", completion: "Completion" };
const statusOrder = ["draft", "instruction", "searches", "enquiries", "contracts", "exchange", "completion"];

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const txId = Number(id);
  const [tab, setTab] = useState("overview");

  const { data: tx, isLoading } = trpc.transaction.byId.useQuery({ id: txId }, { enabled: !!txId });
  const { data: milestones } = trpc.transaction.milestones.useQuery({ transactionId: txId }, { enabled: !!txId });
  const { data: expenses } = trpc.transaction.expenses.useQuery({ transactionId: txId }, { enabled: !!txId });
  const { data: parties } = trpc.transaction.parties.useQuery({ transactionId: txId }, { enabled: !!txId });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700", instruction: "bg-blue-100 text-blue-700", searches: "bg-amber-100 text-amber-700",
    enquiries: "bg-amber-100 text-amber-700", contracts: "bg-purple-100 text-purple-700", exchange: "bg-indigo-100 text-indigo-700",
    completion: "bg-emerald-100 text-emerald-700", archived: "bg-gray-100 text-gray-500",
  };

  if (isLoading) return <div className="space-y-4 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-32 bg-gray-200 rounded" /></div>;
  if (!tx) return <div className="text-center py-12"><FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">Transaction not found</p><Link to="/transactions"><Button variant="link" className="text-emerald-600">Back to transactions</Button></Link></div>;

  const progress = tx.status === "completion" ? 100 : Math.max(5, (statusOrder.indexOf(tx.status) / statusOrder.length) * 100);
  const totalExp = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/transactions"><Button variant="ghost" size="sm" className="mb-2 -ml-2 text-gray-500"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-gray-900">{tx.title}</h1><Badge className={statusColors[tx.status] || "bg-gray-100 text-gray-700"}>{statusLabels[tx.status] || tx.status}</Badge></div>
        <p className="text-gray-500 mt-1">{tx.reference}</p>
      </div>

      <Card><CardContent className="p-6">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Overall Progress</span><span className="text-sm font-bold text-emerald-600">{Math.round(progress)}%</span></div>
        <Progress value={progress} className="h-3" />
      </CardContent></Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><PoundSterling className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-gray-500">Agreed Price</p><p className="text-xl font-bold text-gray-900">&pound;{Number(tx.agreedPrice).toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><PoundSterling className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Costs</p><p className="text-xl font-bold text-gray-900">&pound;{totalExp.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-gray-500">Type</p><p className="text-xl font-bold text-gray-900 capitalize">{tx.type}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="milestones">Milestones</TabsTrigger><TabsTrigger value="expenses">Expenses</TabsTrigger><TabsTrigger value="parties">Parties</TabsTrigger></TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card><CardContent className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Reference</p><p className="font-medium">{tx.reference}</p></div>
              <div><p className="text-sm text-gray-500">Type</p><p className="font-medium capitalize">{tx.type}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><Badge className={statusColors[tx.status]}>{statusLabels[tx.status] || tx.status}</Badge></div>
              <div><p className="text-sm text-gray-500">Survey</p><p className="font-medium capitalize">{tx.surveyType?.replace("_", " ") || "None"}</p></div>
              {tx.mortgageLender && <div><p className="text-sm text-gray-500">Mortgage Lender</p><p className="font-medium">{tx.mortgageLender}</p></div>}
              {tx.depositAmount && <div><p className="text-sm text-gray-500">Deposit</p><p className="font-medium">&pound;{Number(tx.depositAmount).toLocaleString()}</p></div>}
            </div>
            {tx.chainDetails && <div><p className="text-sm text-gray-500">Chain Details</p><p className="font-medium">{tx.chainDetails}</p></div>}
            {tx.notes && <div><p className="text-sm text-gray-500">Notes</p><p className="font-medium">{tx.notes}</p></div>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <Card><CardContent className="p-6">
            {!milestones?.length ? <p className="text-gray-500 text-center py-6">No milestones yet</p> : (
              <div className="space-y-3">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    {m.status === "completed" ? <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" /> : m.status === "overdue" ? <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" /> : m.status === "in_progress" ? <Clock className="w-6 h-6 text-amber-500 flex-shrink-0" /> : <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />}
                    <div className="flex-1"><p className="font-medium">{m.title}</p>{m.description && <p className="text-sm text-gray-500">{m.description}</p>}</div>
                    <Badge className={m.status === "completed" ? "bg-emerald-100 text-emerald-700" : m.status === "overdue" ? "bg-red-100 text-red-700" : m.status === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}>{m.status.replace("_", " ")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card><CardContent className="p-6">
            {!expenses?.length ? <p className="text-gray-500 text-center py-6">No expenses recorded</p> : (
              <div className="space-y-3">
                {expenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div><p className="font-medium">{e.description}</p><p className="text-sm text-gray-500 capitalize">{e.category.replace("_", " ")}</p></div>
                    <div className="text-right"><p className="font-semibold">&pound;{Number(e.amount).toLocaleString()}</p>{e.isPaid ? <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge> : <Badge className="bg-amber-100 text-amber-700">Unpaid</Badge>}</div>
                  </div>
                ))}
                <div className="pt-4 border-t mt-4"><div className="flex justify-between items-center"><span className="font-semibold text-gray-700">Total</span><span className="text-xl font-bold text-gray-900">&pound;{totalExp.toLocaleString()}</span></div></div>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="parties" className="mt-4">
          <Card><CardContent className="p-6">
            {!parties?.length ? <p className="text-gray-500 text-center py-6">No parties added</p> : (
              <div className="space-y-3">
                {parties.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-5 h-5 text-gray-500" /></div>
                    <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-sm text-gray-500 capitalize">{p.role.replace("_", " ")}{p.organisation && ` &middot; ${p.organisation}`}</p></div>
                    <div className="text-right text-sm text-gray-500">{p.email && <p>{p.email}</p>}{p.phone && <p>{p.phone}</p>}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
