import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  useGetDashboardStore,
  useUpdateDashboardStore,
  getGetDashboardStoreQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Copy, Palette, Type, Globe, DollarSign } from "lucide-react";

const FONT_OPTIONS = [
  { value: "Poppins", label: "Poppins", preview: "Modern & Clean" },
  { value: "Inter", label: "Inter", preview: "Neutral & Professional" },
  { value: "Tajawal", label: "Tajawal", preview: "Arabic-Friendly" },
  { value: "Cairo", label: "Cairo", preview: "Arabic & English" },
  { value: "Playfair Display", label: "Playfair Display", preview: "Elegant & Luxury" },
];

const ALL_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-bold text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { data: store, isLoading } = useGetDashboardStore();
  const updateStore = useUpdateDashboardStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    whatsappNumber: "",
    primaryColor: "#C1121F",
    secondaryColor: "#F3F4F6",
    fontFamily: "Poppins",
    coverImage: "",
    logoImage: "",
    currencies: ["USD", "SAR", "YER"] as string[],
    defaultCurrency: "USD",
  });

  useEffect(() => {
    if (store) {
      let currencies = ["USD", "SAR", "YER"];
      try {
        if (store.currencies) currencies = JSON.parse(store.currencies);
      } catch {}
      setForm({
        name: store.name,
        description: store.description || "",
        whatsappNumber: store.whatsappNumber,
        primaryColor: store.primaryColor || "#C1121F",
        secondaryColor: store.secondaryColor || "#F3F4F6",
        fontFamily: store.fontFamily || "Poppins",
        coverImage: store.coverImage || "",
        logoImage: store.logoImage || "",
        currencies,
        defaultCurrency: store.defaultCurrency || "USD",
      });
    }
  }, [store]);

  const toggleCurrency = (code: string) => {
    setForm(f => {
      const has = f.currencies.includes(code);
      const next = has ? f.currencies.filter(c => c !== code) : [...f.currencies, code];
      if (next.length === 0) return f;
      const defaultCurrency = next.includes(f.defaultCurrency) ? f.defaultCurrency : next[0];
      return { ...f, currencies: next, defaultCurrency };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore.mutate({
      data: {
        name: form.name,
        description: form.description || null,
        whatsappNumber: form.whatsappNumber,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor || null,
        fontFamily: form.fontFamily || null,
        coverImage: form.coverImage || null,
        logoImage: form.logoImage || null,
        currencies: JSON.stringify(form.currencies),
        defaultCurrency: form.defaultCurrency,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Store settings saved" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
      }
    });
  };

  const copyStoreLink = () => {
    if (!store) return;
    const url = `${window.location.origin}/store/${store.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Store link copied" });
  };

  if (isLoading) return <DashboardLayout><div className="py-10 text-center text-muted-foreground">Loading settings...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
          <Button variant="outline" onClick={copyStoreLink} className="gap-2 text-sm">
            <Copy className="w-4 h-4" /> Copy Store Link
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <SectionCard icon={Globe} title="Store Info">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Store Name</Label>
                <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Boutique" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your store..." className="resize-none" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">WhatsApp Number</Label>
                <Input required value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="+966512345678" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Cover Image URL</Label>
                <Input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Logo Image URL</Label>
                <Input value={form.logoImage} onChange={e => setForm({ ...form, logoImage: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          </SectionCard>

          {/* Appearance */}
          <SectionCard icon={Palette} title="Colors & Theme">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Primary Color</Label>
                <p className="text-xs text-muted-foreground">Used for buttons, prices, and active states.</p>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <input
                      type="color"
                      className="w-12 h-10 p-1 rounded-lg border border-border cursor-pointer"
                      value={form.primaryColor}
                      onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                    />
                  </div>
                  <Input
                    value={form.primaryColor}
                    onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                    className="flex-1 font-mono text-sm"
                    placeholder="#C1121F"
                  />
                </div>
                {/* Color presets */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {["#C1121F", "#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777", "#1d4ed8"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, primaryColor: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${form.primaryColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Surface / Secondary Color</Label>
                <p className="text-xs text-muted-foreground">Used for card backgrounds and chips.</p>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    className="w-12 h-10 p-1 rounded-lg border border-border cursor-pointer"
                    value={form.secondaryColor}
                    onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                    className="flex-1 font-mono text-sm"
                    placeholder="#F3F4F6"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Typography */}
          <SectionCard icon={Type} title="Typography / Font">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Store Font</Label>
              <p className="text-xs text-muted-foreground">Applied to all text in the customer-facing store.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {FONT_OPTIONS.map(font => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setForm({ ...form, fontFamily: font.value })}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${form.fontFamily === font.value ? "border-primary bg-primary/5" : "border-border hover:border-border/80 hover:bg-surface"}`}
                    style={{ fontFamily: `'${font.value}', sans-serif` }}
                  >
                    <div>
                      <p className="font-semibold text-sm">{font.label}</p>
                      <p className="text-xs text-muted-foreground">{font.preview}</p>
                    </div>
                    {form.fontFamily === font.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Currency */}
          <SectionCard icon={DollarSign} title="Currency Settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Available Currencies for Customers</Label>
                <p className="text-xs text-muted-foreground">Customers will be able to switch between the currencies you enable.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {ALL_CURRENCIES.map(c => {
                    const isSelected = form.currencies.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleCurrency(c.code)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-surface"}`}
                      >
                        <span className="text-base font-bold w-6">{c.symbol}</span>
                        <div>
                          <p className="text-xs font-semibold leading-none">{c.code}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{c.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Default Currency</Label>
                <p className="text-xs text-muted-foreground">The currency shown by default when a customer visits the store.</p>
                <div className="flex gap-2 flex-wrap pt-1">
                  {form.currencies.map(code => {
                    const c = ALL_CURRENCIES.find(x => x.code === code);
                    if (!c) return null;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setForm({ ...form, defaultCurrency: code })}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${form.defaultCurrency === code ? "border-primary bg-primary text-white" : "border-border text-foreground hover:bg-surface"}`}
                      >
                        {c.symbol} {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          <Button type="submit" className="w-full sm:w-auto h-11 px-8 font-semibold" disabled={updateStore.isPending}>
            {updateStore.isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
