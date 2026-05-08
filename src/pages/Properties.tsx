import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Plus, MapPin, Bed, Bath } from "lucide-react";
import { toast } from "sonner";

export default function Properties() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [propertyType, setPropertyType] = useState<string>("");
  const utils = trpc.useUtils();
  const { data: properties, isLoading } = trpc.property.list.useQuery(search ? { search } : { search: undefined });

  const createProperty = trpc.property.create.useMutation({
    onSuccess: () => { utils.property.list.invalidate(); setOpen(false); setPropertyType(""); toast.success("Property created"); },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!propertyType) {
      toast.error("Please select a property type");
      return;
    }
    createProperty.mutate({
      address: f.get("address") as string,
      postcode: f.get("postcode") as string,
      propertyType: propertyType as "freehold" | "leasehold" | "share_of_freehold" | "commonhold",
      price: f.get("price") as string,
      bedrooms: f.get("bedrooms") ? Number(f.get("bedrooms")) : undefined,
      bathrooms: f.get("bathrooms") ? Number(f.get("bathrooms")) : undefined,
      description: (f.get("description") as string) || undefined,
    });
  };

  const statusColors: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-700", under_offer: "bg-amber-100 text-amber-700",
    sold: "bg-blue-100 text-blue-700", withdrawn: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Properties</h1><p className="text-gray-500 mt-1">Manage your UK property portfolio</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> Add Property</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Property</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><Label htmlFor="addr">Address *</Label><Input id="addr" name="address" required placeholder="123 High Street" /></div>
              <div><Label htmlFor="pc">Postcode *</Label><Input id="pc" name="postcode" required placeholder="SW1A 1AA" /></div>
              <div><Label htmlFor="pt">Property Type *</Label>
                <Select value={propertyType} onValueChange={setPropertyType} required>
                  <SelectTrigger id="pt"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent><SelectItem value="freehold">Freehold</SelectItem><SelectItem value="leasehold">Leasehold</SelectItem><SelectItem value="share_of_freehold">Share of Freehold</SelectItem><SelectItem value="commonhold">Commonhold</SelectItem></SelectContent>
                </Select></div>
              <div><Label htmlFor="pr">Price (&pound;) *</Label><Input id="pr" name="price" type="number" required placeholder="450000" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="bd">Bedrooms</Label><Input id="bd" name="bedrooms" type="number" placeholder="3" /></div>
                <div><Label htmlFor="bt">Bathrooms</Label><Input id="bt" name="bathrooms" type="number" placeholder="2" /></div>
              </div>
              <div><Label htmlFor="desc">Description</Label><Input id="desc" name="description" placeholder="Property description..." /></div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={createProperty.isPending}>{createProperty.isPending ? "Creating..." : "Create Property"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by address..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded w-3/4 mb-3" /><div className="h-3 bg-gray-200 rounded w-1/2" /></CardContent></Card>)}
        </div>
      ) : !properties?.length ? (
        <Card><CardContent className="text-center py-12"><Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No properties found</p>
          <Button variant="link" className="text-emerald-600" onClick={() => setOpen(true)}>Add your first property</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={statusColors[p.status] || "bg-gray-100 text-gray-700"}>{p.status.replace("_", " ")}</Badge>
                  <span className="text-lg font-bold text-gray-900">&pound;{Number(p.price).toLocaleString()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.address}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3"><MapPin className="w-3.5 h-3.5 mr-1" />{p.postcode}</div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {p.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{p.bedrooms} beds</span>}
                  {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms} baths</span>}
                </div>
                <div className="mt-3 pt-3 border-t"><span className="text-xs text-gray-400 capitalize">{p.propertyType.replace("_", " ")}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
