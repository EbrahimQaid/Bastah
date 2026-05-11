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
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Copy, Palette, Type, Globe, DollarSign,
  Layout, Megaphone, Image, ExternalLink,
  LayoutGrid, MonitorSmartphone, Instagram, Star, Tag
} from "lucide-react";
import { DEFAULT_THEME, parseThemeConfig, type ThemeConfig } from "@/context/theme-context";

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

const COLOR_PRESETS = ["#C1121F","#7c3aed","#0891b2","#059669","#d97706","#db2777","#1d4ed8","#0f172a","#f97316","#84cc16"];

function SectionCard({ icon: Icon, title, children, id }: { icon: React.ElementType; title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-bold text-sm text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange, presets }: { label: string; value: string; onChange: (v: string) => void; presets?: string[] }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="flex gap-2 items-center">
        <input type="color" className="w-10 h-10 p-1 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0" value={value} onChange={e => onChange(e.target.value)} />
        <Input value={value} onChange={e => onChange(e.target.value)} className="font-mono text-sm" placeholder="#C1121F" />
      </div>
      {presets && (
        <div className="flex gap-1.5 flex-wrap">
          {presets.map(c => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${value === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"}`}
              style={{ background: c }} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
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

  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const setT = (patch: Partial<ThemeConfig>) => setTheme(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    if (store) {
      let currencies = ["USD", "SAR", "YER"];
      try { if (store.currencies) currencies = JSON.parse(store.currencies); } catch {}
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
      setTheme(parseThemeConfig(store.themeConfig));
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
        themeConfig: JSON.stringify(theme),
      }
    }, {
      onSuccess: () => {
        toast({ title: "✓ Store settings saved", description: "Changes are live on your store." });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
      }
    });
  };

  const copyStoreLink = () => {
    if (!store) return;
    const url = `${window.location.origin}/store/${store.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Store link copied!" });
  };

  if (isLoading) return <DashboardLayout><div className="py-16 text-center text-gray-400">Loading settings...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Settings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Full control over your store's look and feel</p>
          </div>
          <div className="flex gap-2">
            {store && (
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-gray-600">
                <ExternalLink className="w-4 h-4" /> Preview
              </a>
            )}
            <button onClick={copyStoreLink} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-gray-600">
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Store Info */}
          <SectionCard icon={Globe} title="Store Info" id="store-info">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">Store Name</Label>
                  <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Boutique" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">WhatsApp Number</Label>
                  <Input required value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="+966512345678" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your store in a sentence..." className="resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUpload label="Cover / Banner Image" hint="Shown as the hero background on your store" value={form.coverImage} onChange={v => setForm({ ...form, coverImage: v })} aspectRatio="wide" />
                <ImageUpload label="Store Logo" hint="Small square logo shown in the navbar" value={form.logoImage} onChange={v => setForm({ ...form, logoImage: v })} aspectRatio="square" />
              </div>
            </div>
          </SectionCard>

          {/* Colors */}
          <SectionCard icon={Palette} title="Brand Colors" id="colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorField label="Primary Color" value={form.primaryColor} onChange={v => setForm({ ...form, primaryColor: v })} presets={COLOR_PRESETS} />
              <ColorField label="Surface / Card Color" value={form.secondaryColor} onChange={v => setForm({ ...form, secondaryColor: v })} />
            </div>
          </SectionCard>

          {/* Navbar */}
          <SectionCard icon={MonitorSmartphone} title="Navbar Style" id="navbar">
            <div className="grid grid-cols-3 gap-3">
              {(["white", "colored", "transparent"] as const).map(s => (
                <button key={s} type="button" onClick={() => setT({ navbarStyle: s })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme.navbarStyle === s ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`w-full h-6 rounded-lg flex items-center px-2 gap-1 ${s === "white" ? "bg-white border border-gray-200" : s === "colored" ? "bg-primary" : "bg-gray-900/70"}`}>
                    <div className={`w-8 h-1.5 rounded ${s === "colored" ? "bg-white" : "bg-gray-400"}`} />
                  </div>
                  <span className="text-xs font-bold capitalize text-gray-700">{s}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Hero */}
          <SectionCard icon={Image} title="Hero Section" id="hero">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Hero Height</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["small", "medium", "large", "fullscreen"] as const).map(h => (
                    <button key={h} type="button" onClick={() => setT({ heroHeight: h })}
                      className={`py-2 rounded-xl border-2 text-xs font-bold capitalize transition-all ${theme.heroHeight === h ? "border-primary bg-primary/5 text-primary" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">Hero Title</Label>
                  <Input value={theme.heroTitle} onChange={e => setT({ heroTitle: e.target.value })} placeholder="Leave empty to use store name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">CTA Button Text</Label>
                  <Input value={theme.heroCtaText} onChange={e => setT({ heroCtaText: e.target.value })} placeholder="Shop Now" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Hero Subtitle</Label>
                <Input value={theme.heroSubtitle} onChange={e => setT({ heroSubtitle: e.target.value })} placeholder="Optional tagline below the title" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Image Overlay Opacity: {theme.heroOverlayOpacity}%</Label>
                <input type="range" min={0} max={80} value={theme.heroOverlayOpacity} onChange={e => setT({ heroOverlayOpacity: +e.target.value })}
                  className="w-full accent-primary" />
              </div>
            </div>
          </SectionCard>

          {/* Layout */}
          <SectionCard icon={LayoutGrid} title="Product Layout" id="layout">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Grid Columns</Label>
                <div className="grid grid-cols-2 gap-3">
                  {([2, 3] as const).map(n => (
                    <button key={n} type="button" onClick={() => setT({ gridCols: n })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme.gridCols === n ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className={`grid gap-1 flex-shrink-0 ${n === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                        {Array.from({ length: n }).map((_, i) => <div key={i} className="w-4 h-4 bg-gray-300 rounded" />)}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{n} Columns</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Card Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["shadow", "bordered", "minimal"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setT({ cardStyle: s })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme.cardStyle === s ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className={`w-full h-10 bg-gray-100 rounded-lg ${s === "shadow" ? "shadow-md" : s === "bordered" ? "border-2 border-gray-300" : ""}`} />
                      <span className="text-xs font-bold capitalize text-gray-600">{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Button Shape</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["sm", "md", "lg", "full"] as const).map(r => (
                    <button key={r} type="button" onClick={() => setT({ buttonRadius: r })}
                      className={`py-2.5 text-xs font-bold border-2 transition-all ${theme.buttonRadius === r ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-gray-300 text-gray-600"} ${r === "sm" ? "rounded-md" : r === "md" ? "rounded-xl" : r === "lg" ? "rounded-2xl" : "rounded-full"}`}>
                      {r === "full" ? "Pill" : r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Sections */}
          <SectionCard icon={Layout} title="Page Sections" id="sections">
            <div className="space-y-1">
              <ToggleRow label="Category Chips" hint="Show category filter chips below the hero" checked={theme.showCategories} onChange={v => setT({ showCategories: v })} />
              <ToggleRow label="Featured Products" hint="Highlighted products section" checked={theme.showFeatured} onChange={v => setT({ showFeatured: v })} />
              <ToggleRow label="All Products" hint="Latest arrivals / all products section" checked={theme.showAllProducts} onChange={v => setT({ showAllProducts: v })} />
            </div>
            {(theme.showFeatured || theme.showAllProducts) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                {theme.showFeatured && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Featured Section Title</Label>
                    <Input value={theme.featuredTitle} onChange={e => setT({ featuredTitle: e.target.value })} className="text-sm" />
                  </div>
                )}
                {theme.showAllProducts && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">All Products Section Title</Label>
                    <Input value={theme.latestTitle} onChange={e => setT({ latestTitle: e.target.value })} className="text-sm" />
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Announcement Bar */}
          <SectionCard icon={Megaphone} title="Announcement Bar" id="announcement">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Message</Label>
                <p className="text-xs text-gray-400">Leave empty to hide the bar. Shown above the navbar.</p>
                <Input value={theme.announcementBar} onChange={e => setT({ announcementBar: e.target.value })} placeholder="🎉 Free shipping on orders over $50!" />
              </div>
              {theme.announcementBar && (
                <div className="grid grid-cols-2 gap-3">
                  <ColorField label="Background Color" value={theme.announcementBarBg} onChange={v => setT({ announcementBarBg: v })} presets={COLOR_PRESETS} />
                  <ColorField label="Text Color" value={theme.announcementBarText} onChange={v => setT({ announcementBarText: v })} presets={["#ffffff","#000000","#fef9c3","#fce7f3"]} />
                </div>
              )}
              {theme.announcementBar && (
                <div className="rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 text-center text-sm font-semibold" style={{ background: theme.announcementBarBg, color: theme.announcementBarText }}>
                    {theme.announcementBar}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Typography */}
          <SectionCard icon={Type} title="Typography" id="typography">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FONT_OPTIONS.map(font => (
                <button key={font.value} type="button" onClick={() => setForm({ ...form, fontFamily: font.value })}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${form.fontFamily === font.value ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-100"}`}
                  style={{ fontFamily: `'${font.value}', sans-serif` }}>
                  <div>
                    <p className="font-semibold text-sm">{font.label}</p>
                    <p className="text-xs text-gray-400">{font.preview}</p>
                  </div>
                  {form.fontFamily === font.value && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Social Links */}
          <SectionCard icon={Instagram} title="Social Links" id="social">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Instagram</Label>
                <Input value={theme.instagram} onChange={e => setT({ instagram: e.target.value })} placeholder="https://instagram.com/yourstore" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">TikTok</Label>
                <Input value={theme.tiktok} onChange={e => setT({ tiktok: e.target.value })} placeholder="https://tiktok.com/@yourstore" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Footer Text</Label>
              <Input value={theme.footerText} onChange={e => setT({ footerText: e.target.value })} placeholder="© 2025 My Store. All rights reserved." />
            </div>
          </SectionCard>

          {/* Currency */}
          <SectionCard icon={DollarSign} title="Currency Settings" id="currency">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Enabled Currencies</Label>
                <p className="text-xs text-gray-400">Customers can switch between the currencies you enable.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_CURRENCIES.map(c => {
                    const isSelected = form.currencies.includes(c.code);
                    return (
                      <button key={c.code} type="button" onClick={() => toggleCurrency(c.code)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"}`}>
                        <span className="text-base font-bold w-6">{c.symbol}</span>
                        <div>
                          <p className="text-xs font-bold leading-none">{c.code}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{c.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Default Currency</Label>
                <div className="flex gap-2 flex-wrap">
                  {form.currencies.map(code => {
                    const c = ALL_CURRENCIES.find(x => x.code === code);
                    if (!c) return null;
                    return (
                      <button key={code} type="button" onClick={() => setForm({ ...form, defaultCurrency: code })}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${form.defaultCurrency === code ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                        {c.symbol} {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Save */}
          <div className="flex gap-3 pb-8">
            <Button type="submit" className="flex-1 h-12 text-base font-bold rounded-2xl" disabled={updateStore.isPending}>
              {updateStore.isPending ? "Saving..." : "Save All Changes"}
            </Button>
            {store && (
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 h-12 border-2 border-gray-200 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-colors text-gray-700">
                <ExternalLink className="w-4 h-4" /> View Store
              </a>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
