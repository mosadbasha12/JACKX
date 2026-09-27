import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  ExternalLink,
  ImagePlus,
  Link2,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Plus,
  Save,
  Settings2,
  Share2,
  Trash2,
  Utensils,
  Wifi,
} from "lucide-react";
import "./styles.css";
import "./logo-controls.css";

type LinkItem = {
  id: string;
  icon: string;
  iconImage?: string;
  title: string;
  detail: string;
  url: string;
  active: boolean;
};
type Brand = {
  name: string;
  tagline: string;
  logo: string;
  logoSize: number;
  logoImageSize: number;
  logoOffsetX: number;
  logoOffsetY: number;
  logoAlign: "start" | "center" | "end";
  logoBg: string;
  accent: string;
  bg: string;
  text: string;
  card: string;
  font: string;
  radius: string;
  companyLogo: string;
  companyName: string;
  companySignature: string;
  companyPhone: string;
  companyWebsite: string;
  companyBg: string;
  companyText: string;
  companyAccent: string;
  companyLogoSize: number;
  companyLogoOffsetX: number;
  companyLogoOffsetY: number;
  companySignatureSize: number;
  companyNameOffsetX: number;
  companyNameOffsetY: number;
  companySignatureOffsetX: number;
  companySignatureOffsetY: number;
  companyPhoneOffsetX: number;
  companyPhoneOffsetY: number;
  companyWebsiteOffsetX: number;
  companyWebsiteOffsetY: number;
  companyFooterWidth: number;
  companyFooterPaddingX: number;
  companyFooterPaddingY: number;
  companyFooterMarginTop: number;
  companyFooterMarginBottom: number;
  companyFooterHeight: number;
  links: LinkItem[];
};
const initial: Brand = {
  name: "Jackx Cafe",
  tagline: "coffee's got a new address",
  logo: "",
  logoSize: 118,
  logoImageSize: 72,
  logoOffsetX: 0,
  logoOffsetY: 0,
  logoAlign: "center",
  logoBg: "#ffffff",
  accent: "#f05a28",
  bg: "#f8ebde",
  text: "#4a2118",
  card: "#fff9f2",
  font: "Cairo",
  radius: "22px",
  companyLogo: "/company-logo.svg",
  companyName: "SCORPION",
  companySignature: "Eng. Mohamed Mosaad",
  companyPhone: "01146300015",
  companyWebsite: "",
  companyBg: "#fff9f2",
  companyText: "#4a2118",
  companyAccent: "#f05a28",
  companyLogoSize: 42,
  companyLogoOffsetX: 0,
  companyLogoOffsetY: 0,
  companySignatureSize: 24,
  companyNameOffsetX: 0,
  companyNameOffsetY: 0,
  companySignatureOffsetX: 0,
  companySignatureOffsetY: 0,
  companyPhoneOffsetX: 0,
  companyPhoneOffsetY: 0,
  companyWebsiteOffsetX: 0,
  companyWebsiteOffsetY: 0,
  companyFooterWidth: 100,
  companyFooterPaddingX: 18,
  companyFooterPaddingY: 12,
  companyFooterMarginTop: 14,
  companyFooterMarginBottom: 0,
  companyFooterHeight: 120,
  links: [
    {
      id: "menu",
      icon: "▤",
      title: "MENU",
      detail: "شوف المنيو الكامل",
      url: "#menu",
      active: true,
    },
    {
      id: "feedback",
      icon: "T",
      title: "FEEDBACK",
      detail: "شاركنا رأيك وتجربتك",
      url: "#feedback",
      active: true,
    },
    {
      id: "maps",
      icon: "⌖",
      title: "Google Maps",
      detail: "افتح موقعنا على الخريطة",
      url: "https://maps.google.com",
      active: true,
    },
    {
      id: "instagram",
      icon: "◎",
      title: "Instagram",
      detail: "تابع أحدث صورنا",
      url: "#instagram",
      active: true,
    },
    {
      id: "whatsapp",
      icon: "◔",
      title: "WhatsApp",
      detail: "تواصل معنا مباشرة",
      url: "https://wa.me/201000000000",
      active: true,
    },
  ],
};
const load = (): Brand => {
  try {
    const stored = JSON.parse(localStorage.getItem("jackx-brand") || "{}");
    return {
      ...initial,
      ...stored,
      companyLogo: stored.companyLogo || initial.companyLogo,
      companyName: stored.companyName || initial.companyName,
      companySignature: stored.companySignature || initial.companySignature,
      companyPhone: stored.companyPhone || initial.companyPhone,
      companyBg: stored.companyBg || initial.companyBg,
      companyText: stored.companyText || initial.companyText,
      companyAccent: stored.companyAccent || initial.companyAccent,
      companyLogoSize: stored.companyLogoSize ?? initial.companyLogoSize,
      companyLogoOffsetX: stored.companyLogoOffsetX ?? initial.companyLogoOffsetX,
      companyLogoOffsetY: stored.companyLogoOffsetY ?? initial.companyLogoOffsetY,
      companySignatureSize: stored.companySignatureSize ?? initial.companySignatureSize,
      companyNameOffsetX: stored.companyNameOffsetX ?? initial.companyNameOffsetX,
      companyNameOffsetY: stored.companyNameOffsetY ?? initial.companyNameOffsetY,
      companySignatureOffsetX: stored.companySignatureOffsetX ?? initial.companySignatureOffsetX,
      companySignatureOffsetY: stored.companySignatureOffsetY ?? initial.companySignatureOffsetY,
      companyPhoneOffsetX: stored.companyPhoneOffsetX ?? initial.companyPhoneOffsetX,
      companyPhoneOffsetY: stored.companyPhoneOffsetY ?? initial.companyPhoneOffsetY,
      companyWebsiteOffsetX: stored.companyWebsiteOffsetX ?? initial.companyWebsiteOffsetX,
      companyWebsiteOffsetY: stored.companyWebsiteOffsetY ?? initial.companyWebsiteOffsetY,
      companyFooterWidth: stored.companyFooterWidth ?? initial.companyFooterWidth,
      companyFooterPaddingX: stored.companyFooterPaddingX ?? initial.companyFooterPaddingX,
      companyFooterPaddingY: stored.companyFooterPaddingY ?? initial.companyFooterPaddingY,
      companyFooterMarginTop: stored.companyFooterMarginTop ?? initial.companyFooterMarginTop,
      companyFooterMarginBottom: stored.companyFooterMarginBottom ?? initial.companyFooterMarginBottom,
      companyFooterHeight: stored.companyFooterHeight ?? initial.companyFooterHeight,
    };
  } catch {
    return initial;
  }
};
const save = (brand: Brand) => {
  try {
    localStorage.setItem("jackx-brand", JSON.stringify(brand));
    return true;
  } catch {
    return false;
  }
};
const fileToDataUrl = (file: File, maxSize = 256) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const source = String(reader.result);
      if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
        resolve(source);
        return;
      }
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.onerror = () => resolve(source);
      image.src = source;
    };
    reader.readAsDataURL(file);
  });

function ClientPage({ brand, onLogoMove }: { brand: Brand; onLogoMove?: (x: number, y: number) => void }) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const drag = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number; size: number } | null>(null);
  const sharePage = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: brand.name, text: brand.tagline, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus("idle"), 2200);
      } else {
        const input = document.createElement("textarea");
        input.value = url;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus("idle"), 2200);
      }
    } catch {
      // Closing the native share sheet is not an error.
    }
  };
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!onLogoMove || !brand.logo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, startOffsetX: brand.logoOffsetX, startOffsetY: brand.logoOffsetY, size: event.currentTarget.clientWidth };
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !onLogoMove) return;
    const nextX = Math.max(-50, Math.min(50, drag.current.startOffsetX + ((event.clientX - drag.current.startX) / drag.current.size) * 100));
    const nextY = Math.max(-50, Math.min(50, drag.current.startOffsetY + ((event.clientY - drag.current.startY) / drag.current.size) * 100));
    onLogoMove(nextX, nextY);
  };
  const css = {
    "--accent": brand.accent,
    "--page-bg": brand.bg,
    "--ink": brand.text,
    "--card": brand.card,
    "--font": brand.font,
  } as CSSProperties;
  return (
    <main className="client" style={css}>
      <header className="client-top">
        <button className="round" type="button" onClick={sharePage} aria-label="مشاركة الصفحة" title={shareStatus === "copied" ? "تم نسخ الرابط" : "مشاركة الصفحة"}>
          <Share2 size={18} />
        </button>
      </header>
      <section className="identity">
        <div
          className={`logo${onLogoMove && brand.logo ? " draggable-logo" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          title={onLogoMove && brand.logo ? "اضغط واسحب اللوجو لضبط مكانه" : undefined}
          style={{
            width: brand.logoSize,
            height: brand.logoSize,
            background: brand.logoBg,
            marginLeft: brand.logoAlign === "start" ? 0 : "auto",
            marginRight: brand.logoAlign === "end" ? 0 : "auto",
            touchAction: "none",
          }}
        >
          {brand.logo ? (
            <img src={brand.logo} alt="لوجو المطعم" style={{ width: `${brand.logoImageSize}%`, height: `${brand.logoImageSize}%`, maxWidth: "none", maxHeight: "none", left: `calc(50% + ${brand.logoOffsetX}%)`, top: `calc(50% + ${brand.logoOffsetY}%)`, transform: "translate(-50%, -50%)" }} />
          ) : (
            <b>JACKX</b>
          )}
        </div>
        <h1>{brand.name}</h1>
        <p>{brand.tagline}</p>
        <div className="socials">
          {brand.links
            .filter((link) => link.active)
            .map((link) => (
              <a href={link.url} key={link.id} title={link.title}>
                {link.iconImage ? <img src={link.iconImage} alt={link.title} /> : link.icon}
              </a>
            ))}
        </div>
      </section>
      <div className="client-links">
        {brand.links
          .filter((l) => l.active)
          .map((link) => (
            <a className="client-link" href={link.url} key={link.id}>
              <span className="link-icon">{link.iconImage ? <img src={link.iconImage} alt="" /> : link.icon}</span>
              <span>
                <strong>{link.title}</strong>
                <small>{link.detail}</small>
              </span>
              <span className="dots">⋮</span>
            </a>
          ))}
      </div>
      <footer className="company-footer" style={{ background: brand.companyBg, color: brand.companyText, "--company-accent": brand.companyAccent, width: `${brand.companyFooterWidth}%`, height: `${brand.companyFooterHeight}px`, minHeight: 0, overflow: "hidden", padding: `${brand.companyFooterPaddingY}px ${brand.companyFooterPaddingX}px`, marginTop: brand.companyFooterMarginTop, marginBottom: brand.companyFooterMarginBottom } as CSSProperties}>
        <div className="company-brand">
          <strong style={{ transform: `translate(${brand.companyNameOffsetX}px, ${brand.companyNameOffsetY}px)` }}>{brand.companyName}</strong>
          <div className="company-logo-box">
            {brand.companyLogo && <img src={brand.companyLogo} alt={brand.companyName} style={{ width: brand.companyLogoSize, height: brand.companyLogoSize, transform: `translate(${brand.companyLogoOffsetX}px, ${brand.companyLogoOffsetY}px)` }} />}
          </div>
        </div>
        <div className="company-info">
          {brand.companySignature && <span className="company-signature" style={{ fontSize: brand.companySignatureSize, transform: `translate(${brand.companySignatureOffsetX}px, ${brand.companySignatureOffsetY}px)` }}>{brand.companySignature}</span>}
          {brand.companyPhone && <a href={`https://wa.me/${brand.companyPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ transform: `translate(${brand.companyPhoneOffsetX}px, ${brand.companyPhoneOffsetY}px)` }}>{brand.companyPhone}</a>}
        </div>
        {brand.companyWebsite && <a className="company-website" style={{ transform: `translate(${brand.companyWebsiteOffsetX}px, ${brand.companyWebsiteOffsetY}px)` }} href={brand.companyWebsite} target="_blank" rel="noreferrer">{brand.companyWebsite}</a>}
      </footer>
    </main>
  );
}

function AdminPage({
  brand,
  setBrand,
}: {
  brand: Brand;
  setBrand: (b: Brand) => void;
}) {
  const [draft, setDraft] = useState(brand);
  const draftRef = useRef(draft);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    setDraft(brand);
    draftRef.current = brand;
  }, [brand]);
  const update = <K extends keyof Brand>(key: K, value: Brand[K]) =>
    (() => {
      const next = { ...draftRef.current, [key]: value };
      draftRef.current = next;
      setDraft(next);
    })();
  const updateLink = (
    id: string,
    key: keyof LinkItem,
    value: string | boolean,
  ) =>
    (() => {
      const next = {
        ...draftRef.current,
        links: draftRef.current.links.map((link) =>
          link.id === id ? { ...link, [key]: value } : link,
        ),
      };
      draftRef.current = next;
      setDraft(next);
    })();
  const addLink = () =>
    (() => {
      const next = {
        ...draftRef.current,
        links: [
          ...draftRef.current.links,
          {
            id: crypto.randomUUID(),
            icon: "★",
            title: "رابط جديد",
            detail: "اكتب وصف الرابط",
            url: "#",
            active: true,
          },
        ],
      };
      draftRef.current = next;
      setDraft(next);
    })();
  const removeLink = (id: string) =>
    (() => {
      const next = { ...draftRef.current, links: draftRef.current.links.filter((link) => link.id !== id) };
      draftRef.current = next;
      setDraft(next);
    })();
  const doSave = () => {
    const snapshot = draftRef.current;
    setBrand(snapshot);
    const success = save(snapshot);
    setSaveError(!success);
    setSaved(success);
    window.setTimeout(() => setSaved(false), 2200);
  };
  return (
    <main className="admin">
      <header className="admin-head">
        <div>
          <span className="kicker">JACKX / BRAND STUDIO</span>
          <h1>لوحة تحكم المطعم</h1>
          <p>ابنِ صفحة QR مميزة لمطعمك وسيب هويتك تظهر كما تريد.</p>
        </div>
        <a href="/?view=client" className="outline">
          <ExternalLink size={16} /> معاينة كاملة
        </a>
      </header>
      <div className="workspace">
        <section className="controls">
          <div className="section-head">
            <span>01</span>
            <div>
              <h2>الهوية والمظهر</h2>
              <p>تحكم كامل في الشكل قبل الحفظ.</p>
            </div>
          </div>
          <label>
            اسم المطعم
            <input
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label>
            الوصف القصير
            <input
              value={draft.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </label>
          <label className="upload">
            <span>
              اللوجو <small>PNG أو JPG</small>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  fileToDataUrl(file, 512).then((data) => update("logo", data));
                }
              }}
            />
            <ImagePlus size={18} />
          </label>
          <div className="logo-controls">
            <label>
              حجم اللوجو <small>{draft.logoSize}px</small>
              <input type="range" min="64" max="220" value={draft.logoSize} onChange={(e) => update("logoSize", Number(e.target.value))} />
            </label>
            <label>
              حجم صورة اللوجو <small>{draft.logoImageSize}%</small>
              <input type="range" min="20" max="250" value={draft.logoImageSize} onChange={(e) => update("logoImageSize", Number(e.target.value))} />
            </label>
            <label>
              محاذاة اللوجو
              <select value={draft.logoAlign} onChange={(e) => update("logoAlign", e.target.value as Brand["logoAlign"])}>
                <option value="start">يمين</option><option value="center">منتصف</option><option value="end">شمال</option>
              </select>
            </label>
            <Color label="خلفية اللوجو" value={draft.logoBg} onChange={(v) => update("logoBg", v)} />
          </div>
          <div className="color-grid">
            <Color
              label="اللون الأساسي"
              value={draft.accent}
              onChange={(v) => update("accent", v)}
            />
            <Color
              label="الخلفية"
              value={draft.bg}
              onChange={(v) => update("bg", v)}
            />
            <Color
              label="لون النص"
              value={draft.text}
              onChange={(v) => update("text", v)}
            />
            <Color
              label="لون البطاقات"
              value={draft.card}
              onChange={(v) => update("card", v)}
            />
          </div>
          <div className="select-grid">
            <label>
              نوع الخط
              <select
                value={draft.font}
                onChange={(e) => update("font", e.target.value)}
              >
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>Arial</option>
                <option>Georgia</option>
              </select>
            </label>
            <label>
              استدارة البطاقات
              <select
                value={draft.radius}
                onChange={(e) => update("radius", e.target.value)}
              >
                <option value="999px">مستدير</option>
                <option value="22px">ناعم</option>
                <option value="8px">مربع</option>
              </select>
            </label>
          </div>
          <button className="save" onClick={doSave}>
            <Save size={18} /> {saveError ? "تعذر الحفظ" : saved ? "تم الحفظ" : "حفظ التخصيص"}
          </button>
        </section>
        <section className="preview">
          <div className="section-head">
            <span>02</span>
            <div>
              <h2>معاينة مباشرة</h2>
              <p>التغييرات تظهر لحظيًا.</p>
            </div>
          </div>
          <div className="preview-window">
            <ClientPage brand={{ ...draft }} onLogoMove={(x, y) => setDraft((current) => { const next = { ...current, logoOffsetX: x, logoOffsetY: y }; draftRef.current = next; return next; })} />
          </div>
        </section>
      <section className="links">
        <div className="section-head">
          <span>03</span>
          <div>
            <h2>روابط الصفحة</h2>
            <p>أضف المنيو، التواصل، الموقع وأي رابط خاص بالمطعم.</p>
          </div>
        </div>
        <div className="link-editor">
          {draft.links.map((link) => (
            <div className="link-row" key={link.id}>
              <label className="link-icon-upload" title="ارفع أيقونة الرابط">
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; fileToDataUrl(file, 128).then((data) => updateLink(link.id, "iconImage", data)); }} />
                {link.iconImage ? <img src={link.iconImage} alt="أيقونة الرابط" /> : <span>{link.icon}</span>}
              </label>
              <input
                value={link.title}
                onChange={(e) => updateLink(link.id, "title", e.target.value)}
                aria-label="عنوان الرابط"
              />
              <input
                value={link.detail}
                onChange={(e) => updateLink(link.id, "detail", e.target.value)}
                aria-label="وصف الرابط"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(link.id, "url", e.target.value)}
                aria-label="الرابط"
              />
              <button
                className="icon-btn"
                onClick={() => removeLink(link.id)}
                aria-label="حذف"
              >
                <Trash2 size={17} />
              </button>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={link.active}
                  onChange={(e) =>
                    updateLink(link.id, "active", e.target.checked)
                  }
                />
                <span />
              </label>
            </div>
          ))}
        </div>
        <button className="add" onClick={addLink}>
          <Plus size={17} /> إضافة رابط
        </button>
      </section>
      <section className="company-settings">
        <div className="section-head"><span>04</span><div><h2>هوية أسفل الصفحة</h2><p>لوجو شركتك وتوقيعك وبيانات التواصل.</p></div></div>
          <div className="company-grid">
          <label className="upload"><span>لوجو الشركة <small>PNG أو JPG</small></span><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; fileToDataUrl(file, 512).then((data) => update("companyLogo", data)); }} /><ImagePlus size={18} /></label>
          <label>اسم الشركة / البراند<input value={draft.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="JACKX" /></label>
          <label>التوقيع أو الوصف<input value={draft.companySignature} onChange={(e) => update("companySignature", e.target.value)} placeholder="تصميم وتطوير" /></label>
          <label>رقم التواصل<input value={draft.companyPhone} onChange={(e) => update("companyPhone", e.target.value)} placeholder="01xxxxxxxxx" /></label>
          <label>رابط الموقع أو الصفحة<input value={draft.companyWebsite} onChange={(e) => update("companyWebsite", e.target.value)} placeholder="https://..." /></label>
          <div className="company-controls">
            <label>حجم لوجو الشركة <small>{draft.companyLogoSize}px</small><input type="range" min="24" max="120" value={draft.companyLogoSize} onChange={(e) => update("companyLogoSize", Number(e.target.value))} /></label>
            <label>حجم التوقيع <small>{draft.companySignatureSize}px</small><input type="range" min="12" max="42" value={draft.companySignatureSize} onChange={(e) => update("companySignatureSize", Number(e.target.value))} /></label>
            <label>تحريك اللوجو أفقيًا <small>{draft.companyLogoOffsetX}px</small><input type="range" min="-40" max="40" value={draft.companyLogoOffsetX} onChange={(e) => update("companyLogoOffsetX", Number(e.target.value))} /></label>
            <label>تحريك اللوجو رأسيًا <small>{draft.companyLogoOffsetY}px</small><input type="range" min="-40" max="40" value={draft.companyLogoOffsetY} onChange={(e) => update("companyLogoOffsetY", Number(e.target.value))} /></label>
            <Color label="خلفية الفوتر" value={draft.companyBg} onChange={(v) => update("companyBg", v)} />
            <Color label="لون نص الفوتر" value={draft.companyText} onChange={(v) => update("companyText", v)} />
            <Color label="لون التوقيع والروابط" value={draft.companyAccent} onChange={(v) => update("companyAccent", v)} />
            <div className="company-element-controls">
              <strong>مواضع عناصر الفوتر</strong>
              {([['اسم الشركة', 'companyNameOffsetX', 'companyNameOffsetY'], ['التوقيع', 'companySignatureOffsetX', 'companySignatureOffsetY'], ['الرقم', 'companyPhoneOffsetX', 'companyPhoneOffsetY'], ['الرابط', 'companyWebsiteOffsetX', 'companyWebsiteOffsetY']] as const).map(([label, xKey, yKey]) => (
                <div className="element-position" key={label}>
                  <b>{label}</b>
                  <label>يمين / شمال <small>{draft[xKey]}px</small><input type="range" min="-60" max="60" value={draft[xKey]} onChange={(e) => update(xKey, Number(e.target.value))} /></label>
                  <label>فوق / تحت <small>{draft[yKey]}px</small><input type="range" min="-60" max="60" value={draft[yKey]} onChange={(e) => update(yKey, Number(e.target.value))} /></label>
                </div>
              ))}
            </div>
            <div className="company-dimension-controls">
              <strong>أبعاد الفوتر</strong>
              <label>عرض الفوتر <small>{draft.companyFooterWidth}%</small><input type="range" min="70" max="100" value={draft.companyFooterWidth} onChange={(e) => update("companyFooterWidth", Number(e.target.value))} /></label>
              <label>طول / ارتفاع الفوتر <small>{draft.companyFooterHeight === 0 ? "تلقائي" : `${draft.companyFooterHeight}px`}</small><input type="range" min="0" max="300" value={draft.companyFooterHeight} onChange={(e) => update("companyFooterHeight", Number(e.target.value))} /></label>
              <label>المسافة الداخلية يمين / شمال <small>{draft.companyFooterPaddingX}px</small><input type="range" min="0" max="80" value={draft.companyFooterPaddingX} onChange={(e) => update("companyFooterPaddingX", Number(e.target.value))} /></label>
              <label>المسافة الداخلية فوق / تحت <small>{draft.companyFooterPaddingY}px</small><input type="range" min="0" max="80" value={draft.companyFooterPaddingY} onChange={(e) => update("companyFooterPaddingY", Number(e.target.value))} /></label>
              <label>المسافة الخارجية فوق <small>{draft.companyFooterMarginTop}px</small><input type="range" min="0" max="50" value={draft.companyFooterMarginTop} onChange={(e) => update("companyFooterMarginTop", Number(e.target.value))} /></label>
              <label>المسافة الخارجية تحت <small>{draft.companyFooterMarginBottom}px</small><input type="range" min="0" max="50" value={draft.companyFooterMarginBottom} onChange={(e) => update("companyFooterMarginBottom", Number(e.target.value))} /></label>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="color-field">
      {label}
      <span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <code>{value}</code>
      </span>
    </label>
  );
}
function App() {
  const [brand, setBrand] = useState(load);
  useEffect(() => {
    const refreshFromStorage = () => setBrand(load());
    window.addEventListener("storage", refreshFromStorage);
    return () => window.removeEventListener("storage", refreshFromStorage);
  }, []);
  const requestedView = new URLSearchParams(location.search).get("view");
  const hostView =
    location.hostname === "jackx-qr-scorpion.vercel.app"
      ? "client"
      : location.hostname === "admin-jackx-qr-scorpion.vercel.app"
        ? "admin"
        : null;
  const client =
    (requestedView ?? hostView) === "client" || location.pathname === "/client";
  return client ? (
    <ClientPage brand={brand} />
  ) : (
    <AdminPage brand={brand} setBrand={setBrand} />
  );
}
createRoot(document.getElementById("root")!).render(<App />);
