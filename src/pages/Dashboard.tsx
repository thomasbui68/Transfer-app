import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import { Building2, FileText, TrendingUp, Clock, CheckCircle2, ArrowRight, Bot, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: transactions } = trpc.transaction.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: properties } = trpc.property.list.useQuery(undefined, { enabled: isAuthenticated });

  const activeTx = transactions?.filter(t => t.status !== "archived" && t.status !== "completion").length || 0;
  const completedTx = transactions?.filter(t => t.status === "completion").length || 0;
  const totalProps = properties?.length || 0;

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
  const statusOrder = ["draft", "instruction", "searches", "enquiries", "contracts", "exchange", "completion"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your property transactions</p>
        </div>
        <div className="flex gap-3">
          <Link to="/assistant"><Button variant="outline" className="hidden sm:flex items-center gap-2"><Bot className="w-4 h-4" /> AI Assistant</Button></Link>
          <Link to="/transactions"><Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"><Plus className="w-4 h-4" /> New Transaction</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-500">Active Transactions</p><p className="text-3xl font-bold text-gray-900 mt-2">{activeTx}</p></div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600"><TrendingUp className="w-4 h-4 mr-1" /> In progress</div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-500">Completed</p><p className="text-3xl font-bold text-gray-900 mt-2">{completedTx}</p></div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-600"><Clock className="w-4 h-4 mr-1" /> This year</div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-500">Properties</p><p className="text-3xl font-bold text-gray-900 mt-2">{totalProps}</p></div>
            <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center"><Building2 className="w-6 h-6 text-violet-600" /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-violet-600"><TrendingUp className="w-4 h-4 mr-1" /> Total managed</div>
        </CardContent></Card>
      </div>

      <Card>
        <div className="p-6 pb-2 flex items-center justify-between">
          <div><h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2><p className="text-sm text-gray-500">Your latest property transactions</p></div>
          <Link to="/transactions"><Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">View all <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
        <CardContent>
          {!transactions?.length ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No transactions yet</p>
              <Link to="/transactions"><Button variant="link" className="text-emerald-600 mt-2">Create your first transaction</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map(tx => (
                <Link key={tx.id} to={`/transactions/${tx.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900 truncate">{tx.title}</h3>
                      <Badge className={statusColors[tx.status] || "bg-gray-100 text-gray-700"}>{statusLabels[tx.status] || tx.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Ref: {tx.reference} &middot; {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">&pound;{Number(tx.agreedPrice).toLocaleString()}</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {transactions && transactions.length > 0 && (
        <Card>
          <div className="p-6 pb-2"><h2 className="text-lg font-bold text-gray-900">Transaction Progress</h2><p className="text-sm text-gray-500">Pipeline overview of active transactions</p></div>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 3).map(tx => {
                const progress = tx.status === "completion" ? 100 : Math.max(10, (statusOrder.indexOf(tx.status) / statusOrder.length) * 100);
                return (
                  <div key={tx.id}>
                    <div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium text-gray-700 truncate">{tx.title}</span><span className="text-sm text-gray-500">{Math.round(progress)}%</span></div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
