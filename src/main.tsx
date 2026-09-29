import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  Bell,
  Check,
  ChefHat,
  Clock3,
  Coffee,
  Download,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  Settings2,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";
import {
  auth,
  addExpense,
  createOrder,
  createStaffAccountByUsername,
  deleteCategory,
  deleteMenuItem,
  loadOperationMode,
  loadPaymentMethods,
  loginCustomer,
  loginStaffByUsername,
  registerCustomer,
  saveMenuItem,
  saveCategory,
  saveOperationMode,
  savePaymentMethods,
  setStaffRole,
  updateOrder,
  watchCustomerOrders,
  watchCustomers,
  watchAllOrders,
  watchOrders,
  watchMenu,
  watchCategories,
  watchCategoryRecords,
  saveCategoryRecord,
  deleteCategoryRecord,
  watchPaymentRecords,
  savePaymentRecords,
  watchOperationRecords,
  saveOperationRecords,
  watchStaffRecords,
  saveStaffRecord,
  deleteStaffRecord,
  type CategoryRecord,
  type PaymentRecord,
  type OperationRecord,
  type StaffRecord,
  type OperationMode,
  type PaymentMethod,
} from "./firebase";

type Product = {
  id: number;
  name: string;
  en: string;
  price: number;
  cat: string;
  img: string;
  station: "bar" | "kitchen";
  available?: boolean;
  description?: string;
};
type Line = Product & { qty: number };
type Order = {
  id: string;
  docId?: string;
  type: "delivery" | "dinein";
  name: string;
  phone: string;
  table?: string;
  address?: string;
  payment: string;
  items: Line[];
  status: "new" | "preparing" | "ready" | "done";
};
const cats = ["كل الأصناف", "قهوة", "مشروبات باردة", "فطور", "حلويات"];
const uniqueProducts = (items: Product[], includeUnavailable = false) =>
  Array.from(
    new Map(
      items
        .filter((item) => includeUnavailable || item.available !== false)
        .map((item) => [String(item.id), item]),
    ).values(),
  );
const eg = (n: number) => `${n} ج.م`;
function Logo() {
  return (
    <div className="logo">
      <b>J</b>
      <span>
        JACKX<small>coffee & bites</small>
      </span>
    </div>
  );
}
async function logoutStaff() {
  await auth.signOut();
  window.location.reload();
}
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
function InstallButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (installed) return null;
  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
      return;
    }
    window.alert("لتثبيت JACKX على الآيفون: اضغط مشاركة ثم إضافة إلى الشاشة الرئيسية. على أندرويد افتح قائمة المتصفح واختر تثبيت التطبيق.");
  };
  return (
    <button className="install-app" type="button" onClick={install}>
      <Download size={16} /> تثبيت التطبيق
    </button>
  );
}
function CustomerAuth({ onReady }: { onReady: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login"),
    [phone, setPhone] = useState(""),
    [name, setName] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    try {
      if (mode === "register") await registerCustomer(phone, password, name);
      else await loginCustomer(phone, password);
      window.dispatchEvent(new Event("jackx-customer-changed"));
      onReady();
    } catch {
      setError("راجع رقم الهاتف وكلمة المرور وحاول مرة أخرى");
    }
  };
  return (
    <div className="customer-auth">
      <div className="auth-tabs">
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          دخول
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          حساب جديد
        </button>
      </div>
      <h2>{mode === "login" ? "أهلاً بيك تاني" : "أنشئ حسابك في JACKX"}</h2>
      <p>
        {mode === "login"
          ? "تابع طلباتك وفواتيرك واطلب مفضلاتك بسرعة."
          : "سجل مرة واحدة وخلي طلباتك المفضلة دايمًا جاهزة."}
      </p>
      <form onSubmit={submit}>
        {mode === "register" && (
          <input
            required
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          required
          placeholder="رقم الهاتف"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="password-wrap">
          <input
            required
            type={show ? "text" : "password"}
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShow(!show)}>
            {show ? "إخفاء" : "إظهار"}
          </button>
        </div>
        {mode === "register" && (
          <input
            required
            type={show ? "text" : "password"}
            placeholder="تأكيد كلمة المرور"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}{" "}
        {error && <small className="error">{error}</small>}
        <button className="btn" type="submit">
          {mode === "login" ? "دخول لحسابي" : "إنشاء الحساب"}{" "}
          <ArrowLeft size={17} />
        </button>
      </form>
    </div>
  );
}
function CustomerPortal({ menuItems }: { menuItems: Product[] | null }) {
  const [open, setOpen] = useState(false),
    [ready, setReady] = useState(!!auth.currentUser),
    [orders, setOrders] = useState<any[]>([]),
    [tab, setTab] = useState<"orders" | "favorites">("orders"),
    [favs, setFavs] = useState<number[]>(() =>
      JSON.parse(localStorage.getItem("jackx-favorites") || "[]"),
    );
  useEffect(() => {
    if (!auth.currentUser) return;
    return watchCustomerOrders(auth.currentUser.uid, setOrders, console.error);
  }, [ready]);
  const toggle = (id: number) =>
    setFavs((x) => {
      const n = x.includes(id) ? x.filter((i) => i !== id) : [...x, id];
      localStorage.setItem("jackx-favorites", JSON.stringify(n));
      return n;
    });
  return (
    <>
      <button className="customer-trigger" onClick={() => setOpen(true)}>
        <UserRound size={17} />
        {ready ? "حسابي" : "دخول العملاء"}
      </button>
      {open && (
        <div className="shade customer-shade" onClick={() => setOpen(false)}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setOpen(false)}>
              <X />
            </button>
            {!ready ? (
              <CustomerAuth onReady={() => setReady(true)} />
            ) : (
              <>
                <div className="customer-head">
                  <label>MY JACKX</label>
                  <h2>حسابي</h2>
                  <p>طلباتك وفواتيرك ومفضلاتك في مكان واحد.</p>
                </div>
                <div className="auth-tabs">
                  <button
                    className={tab === "orders" ? "active" : ""}
                    onClick={() => setTab("orders")}
                  >
                    طلباتي السابقة
                  </button>
                  <button
                    className={tab === "favorites" ? "active" : ""}
                    onClick={() => setTab("favorites")}
                  >
                    المفضلة
                  </button>
                </div>
                {tab === "orders" ? (
                  <div className="customer-list">
                    {orders.length ? (
                      orders.map((o) => (
                        <div className="customer-order" key={o.docId || o.id}>
                          <b>{o.id}</b>
                          <span>
                            {o.status === "new"
                              ? "جديد"
                              : o.status === "preparing"
                                ? "قيد التحضير"
                                : o.status === "ready"
                                  ? "جاهز"
                                  : "مكتمل"}
                          </span>
                          <small>
                            {o.items
                              ?.map((i: any) => `${i.qty}× ${i.name}`)
                              .join("، ")}
                          </small>
                        </div>
                      ))
                    ) : (
                      <p className="empty">
                        لسه مفيش طلبات سابقة. أول طلب مستنيك ☕
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="customer-list">
                    {(menuItems || []).map((p) => (
                      <button
                        className="favorite-row"
                        key={p.id}
                        onClick={() => toggle(p.id)}
                      >
                        <img src={p.img} alt={p.en} loading="lazy" decoding="async" />
                        <span>
                          {p.name}
                          <small>{p.en}</small>
                        </span>
                        <b>{favs.includes(p.id) ? "♥" : "♡"}</b>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="logout"
                  onClick={() => {
                    auth.signOut();
                    window.dispatchEvent(new Event("jackx-customer-changed"));
                    setReady(false);
                    setOpen(false);
                  }}
                >
                  تسجيل الخروج
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
function StaffLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginStaffByUsername(username, password);
      onLogin();
    } catch {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };
  return (
    <main className="dash login-page" dir="rtl">
      <div className="login-card">
        <Logo />
        <label>JACKX / STAFF ACCESS</label>
        <h1>تسجيل دخول الموظفين</h1>
        <p>ادخل اسم المستخدم وكلمة المرور للمتابعة.</p>
        <form onSubmit={submit}>
          <input
            required
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="password-wrap">
            <input
              type={show ? "text" : "password"}
              required
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? "إخفاء" : "إظهار"}
            </button>
          </div>
          {error && <small className="error">{error}</small>}
          <button className="btn" type="submit">
            دخول آمن <ArrowLeft size={17} />
          </button>
        </form>
      </div>
    </main>
  );
}
function Client({
  addOrder,
  paymentMethods,
  menuItems,
}: {
  addOrder: (o: Order) => void;
  paymentMethods: PaymentMethod[];
  menuItems: Product[] | null;
}) {
  const [cat, setCat] = useState("كل الأصناف"),
    [q, setQ] = useState(""),
    [cart, setCart] = useState<Line[]>([]),
    [modal, setModal] = useState<Product | null>(null),
    [checkout, setCheckout] = useState<"delivery" | "dinein" | null>(null),
    [notice, setNotice] = useState(""),
    [favorites, setFavorites] = useState<number[]>(() =>
      JSON.parse(localStorage.getItem("jackx-favorites") || "[]"),
    );
  const [customerUid, setCustomerUid] = useState(auth.currentUser?.uid || "");
  useEffect(() => {
    const sync = () => setCustomerUid(auth.currentUser?.uid || "");
    window.addEventListener("jackx-customer-changed", sync);
    return () => window.removeEventListener("jackx-customer-changed", sync);
  }, []);
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".client .reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [menuItems]);
  const add = (p: Product) =>
    setCart((c) =>
      c.some((x) => x.id === p.id)
        ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...p, qty: 1 }],
    );
  const list = (menuItems || []).filter(
    (p) =>
      (cat === "كل الأصناف" || p.cat === cat) &&
      `${p.name}${p.en}`.toLowerCase().includes(q.toLowerCase()),
  );
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const toggleFavorite = (id: number) =>
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id];
      localStorage.setItem("jackx-favorites", JSON.stringify(next));
      return next;
    });
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    addOrder({
      id: "#JX-" + Math.floor(1000 + Math.random() * 8999),
      type: checkout!,
      name: customerUid ? "عميل مسجل" : String(f.get("name")),
      phone: customerUid ? "" : String(f.get("phone")),
      address: String(f.get("address") || ""),
      table: String(f.get("table") || ""),
      payment: String(f.get("payment")),
      items: cart,
      status: "new",
    });
    setCart([]);
    setCheckout(null);
    setModal(null);
    setNotice("تم استلام طلبك بنجاح ✨");
    setTimeout(() => setNotice(""), 3000);
  };
  return (
    <main className="client" dir="rtl">
      <nav>
        <Logo />
        <InstallButton />
        <button
          className="cart"
          onClick={() => setModal({ ...(menuItems?.[0] || { en: "YOUR ORDER", price: 0, img: "", cat: "", station: "bar" }), id: -1, name: "السلة" })}
        >
          <ShoppingBag size={18} /> السلة{" "}
          {cart.length > 0 && <b>{cart.reduce((s, x) => s + x.qty, 0)}</b>}
        </button>
      </nav>
      <section className="hero">
        <div className="reveal-on-scroll is-visible">
          <label>FRESH COFFEE. GOOD MOOD.</label>
          <h1>
            مزاجك الحلو
            <br />
            <i>يبدأ من هنا</i>
          </h1>
          <p>قهوة محمصة بحب، أكل يفرحك، وتفاصيل صغيرة تخلي يومك ألطف.</p>
          <a className="btn" href="#menu">
            اطلب دلوقتي <ArrowLeft size={18} />
          </a>
        </div>
        <div className="hero-img reveal-on-scroll is-visible">
          <img
            src={menuItems?.[0]?.img || "/jackx-logo.png"}
            alt="JACKX"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <span>
            طازج كل يوم
            <br />
            <small>made with love</small>
          </span>
        </div>
      </section>
      <section id="menu" className="menu">
        <header className="reveal-on-scroll">
          <div>
            <label>OUR MENU / المنيو</label>
            <h2>اختار اللي على مزاجك</h2>
          </div>
          <div className="search">
            <Search size={17} />
            <input
              placeholder="دور على صنف..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </header>
        <div className="cats reveal-on-scroll">
          {cats.map((c) => (
            <button
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid">
          {menuItems === null ? <div className="menu-loading">جاري تحميل المنيو...</div> : list.length ? list.map((p) => (
              <article className="reveal-on-scroll" key={p.id}>
                <img src={p.img} alt={p.en} loading="lazy" decoding="async" />
                <button
                  className="favorite-card"
                  aria-label="إضافة للمفضلة"
                  onClick={() => toggleFavorite(p.id)}
                >
                  {favorites.includes(p.id) ? "♥" : "♡"}
                </button>
              <button className="plus" onClick={() => add(p)}>
                <Plus />
              </button>
              <div>
                <small>{p.name}</small>
                <h3>{p.en}</h3>
                <strong>{eg(p.price)}</strong>
                <button className="order" onClick={() => setModal(p)}>
                  اطلبه دلوقتي <ArrowLeft size={15} />
                </button>
              </div>
            </article>
          )) : <div className="menu-loading">لا توجد أصناف متاحة حاليًا.</div>}
        </div>
      </section>
      <section id="story" className="story reveal-on-scroll">
        <label>WHY JACKX</label>
        <h2>
          مش مجرد قهوة.
          <br />
          <i>دي طاقة يومك.</i>
        </h2>
        <div>
          <p>
            <b>01</b> اختار براحتك
          </p>
          <p>
            <b>02</b> اطلب في ثواني
          </p>
          <p>
            <b>03</b> استمتع باللحظة
          </p>
        </div>
      </section>
      {notice && (
        <div className="notice">
          <Check /> {notice}
        </div>
      )}
      {modal && (
        <div className="shade" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal(null)}>
              <X />
            </button>
            {modal.id !== -1 ? (
              <>
                <img src={modal.img} alt={modal.en} loading="lazy" decoding="async" />
                <div className="pad">
                  <label>{modal.name}</label>
                  <h2>{modal.en}</h2>
                  <p>{modal.description || "اختيار JACKX المميز بطعم طازج وتجربة مختلفة."}</p>
                  <div className="row">
                    <b>{eg(modal.price)}</b>
                    <button className="btn" onClick={() => add(modal)}>
                      أضف للسلة <Plus size={17} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pad">
                <label>YOUR ORDER</label>
                <h2>طلبك الحالي</h2>
                {cart.length === 0 ? (
                  <p>السلة لسه فاضية ☕</p>
                ) : (
                  <>
                    {cart.map((x) => (
                      <div className="cartrow" key={x.id}>
                        <span>
                          {x.name}
                          <small>{eg(x.price)}</small>
                        </span>
                        <div>
                          <button
                            onClick={() =>
                              setCart((c) =>
                                c.flatMap((y) =>
                                  y.id === x.id
                                    ? y.qty > 1
                                      ? [{ ...y, qty: y.qty - 1 }]
                                      : []
                                    : [y],
                                ),
                              )
                            }
                          >
                            <Minus size={13} />
                          </button>
                          {x.qty}
                          <button onClick={() => add(x)}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="total">
                      الإجمالي <b>{eg(total)}</b>
                    </div>
                    <div className="choices">
                      <button onClick={() => setCheckout("delivery")}>
                        <Truck /> توصيل
                      </button>
                      <button onClick={() => setCheckout("dinein")}>
                        <Store /> داخل الفرع
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {checkout && (
        <div className="shade">
          <div className="form modal">
            <button className="close" onClick={() => setCheckout(null)}>
              <X />
            </button>
            <label>{checkout === "delivery" ? "DELIVERY" : "DINE IN"}</label>
            <h2>
              {checkout === "delivery" ? "هنوصلهولك فين؟" : "جاهز نجهز طلبك؟"}
            </h2>
            <form onSubmit={submit}>
              {!customerUid && (
                <>
                  <input name="name" required placeholder="الاسم" />
                  <input name="phone" required placeholder="رقم الموبايل" />
                </>
              )}
              {checkout === "delivery" ? (
                <input name="address" required placeholder="العنوان" />
              ) : (
                <input name="table" required placeholder="رقم الترابيزة" />
              )}
              {!customerUid && (
                <select name="payment">
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method === "cash"
                        ? "نقدي"
                        : method === "card"
                          ? "فيزا / كارت"
                          : "محفظة إلكترونية"}
                    </option>
                  ))}
                </select>
              )}
              <button className="btn" type="submit">
                تأكيد الطلب <Check size={17} />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
function Cashier({
  orders,
  setOrders,
  operationMode,
}: {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  operationMode: OperationMode;
}) {
  const lastNewCount = useRef(0);
  useEffect(() => {
    const count = orders.filter((o) => o.status === "new").length;
    if (count > lastNewCount.current) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch {
        /* browser may block audio until interaction */
      }
      if ("Notification" in window && Notification.permission === "granted")
        new Notification("طلب JACKX جديد", {
          body: "يوجد طلب جديد يحتاج المراجعة",
        });
    }
    lastNewCount.current = count;
  }, [orders]);
  const next = (o: Order) => {
    const status =
      o.status === "new"
        ? "preparing"
        : o.status === "preparing"
          ? "ready"
          : "done";
    if (o.docId) updateOrder(o.docId, status).catch(console.error);
    setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status } : x)));
  };
  return (
    <main className="dash" dir="rtl">
      <header>
        <Logo />
        <span>
          الكاشير: <b>محمد أحمد</b>
        </span>
        <button className="staff-logout" type="button" onClick={() => void logoutStaff()}>
          <LogOut size={16} /> تسجيل الخروج
        </button>
      </header>
      <section className="dashbody">
        <label>JACKX / CASHIER</label>
        <h1>الطلبات الحالية</h1>
        <p className="mode-pill">
          وضع التشغيل:{" "}
          {operationMode === "cashier"
            ? "الكاشير أولًا"
            : operationMode === "direct-screen"
              ? "شاشات مباشرة"
              : "طباعة مباشرة"}
        </p>
        <div className="stats">
          <div>
            <Bell /> طلبات جديدة{" "}
            <b>{orders.filter((o) => o.status === "new").length}</b>
          </div>
          <div>
            <Clock3 /> قيد التحضير{" "}
            <b>{orders.filter((o) => o.status === "preparing").length}</b>
          </div>
          <div>
            <Wallet /> مبيعات اليوم <b>8,450 ج.م</b>
          </div>
        </div>
        <div className="tickets">
          {orders
            .filter((o) => o.status !== "done")
            .map((o) => (
              <article className={o.status} key={o.id}>
                <div className="tickettop">
                  <b>{o.id}</b>
                  <span>
                    {o.type === "delivery" ? "توصيل" : "ترابيزة " + o.table}
                  </span>
                </div>
                <p>
                  <UserRound size={15} /> {o.name} - {o.phone}
                </p>
                {o.items.map((x) => (
                  <div className="item" key={x.id}>
                    <span>
                      {x.qty}× {x.name}
                    </span>
                    <b>{eg(x.price * x.qty)}</b>
                  </div>
                ))}
                <footer>
                  <b>{eg(o.items.reduce((s, x) => s + x.price * x.qty, 0))}</b>
                  <button onClick={() => window.print()}>
                    <Printer size={15} /> طباعة
                  </button>
                  <button className="btn" onClick={() => next(o)}>
                    {o.status === "new"
                      ? "قبول وتجهيز"
                      : o.status === "preparing"
                        ? "تم التجهيز"
                        : "تسليم الطلب"}{" "}
                    <ArrowLeft size={15} />
                  </button>
                </footer>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
function Admin({
  orders,
  operationMode,
  onOperationModeChange,
  paymentMethods,
  onPaymentMethodsChange,
}: {
  orders: Order[];
  operationMode: OperationMode;
  onOperationModeChange: (mode: OperationMode) => void;
  paymentMethods: PaymentMethod[];
  onPaymentMethodsChange: (methods: PaymentMethod[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "menu" | "orders" | "expenses" | "customers" | "settings"
  >("overview");
  const [menuItems, setMenuItems] = useState<Product[]>([]),
    [menuSearch, setMenuSearch] = useState(""),
    [menuFilter, setMenuFilter] = useState("كل الأقسام"),
    [categories, setCategories] = useState<string[]>(cats.slice(1)),
    [editingId, setEditingId] = useState<number | null>(null),
    [savingMenu, setSavingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    en: "",
    img: "",
    price: "",
    cat: cats[1],
    station: "bar" as "bar" | "kitchen",
    description: "",
  });
  const [categoryName, setCategoryName] = useState(""),
    [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [operationRecords, setOperationRecords] = useState<OperationRecord[]>([]);
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>([]);
  const [settingsSearch, setSettingsSearch] = useState("");
  const [settingsFilter, setSettingsFilter] = useState("all");
  const [paymentDraft, setPaymentDraft] = useState({ name: "", company: "", account: "", owner: "" });
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [operationDraft, setOperationDraft] = useState({ id: "cashier" as OperationMode, name: "" });
  const [editingOperation, setEditingOperation] = useState<OperationMode | null>(null);
  const [staffPhone, setStaffPhone] = useState("");
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  useEffect(
    () =>
      watchMenu((items) => {
        if (items.length) setMenuItems(uniqueProducts(items as Product[], true));
      }, console.error),
    [],
  );
  useEffect(
    () =>
      watchCategories((items) => {
        if (items.length) setCategories(items);
      }, console.error),
    [],
  );
  useEffect(() => watchCustomers(setCustomerProfiles, console.error), []);
  useEffect(() => watchCategoryRecords(setCategoryRecords, console.error), []);
  useEffect(() => watchPaymentRecords(setPaymentRecords, console.error), []);
  useEffect(() => watchOperationRecords(setOperationRecords, console.error), []);
  useEffect(() => watchStaffRecords(setStaffRecords, console.error), []);
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [showPassword, setShowPassword] = useState(false),
    [role, setRole] = useState("cashier"),
    [saved, setSaved] = useState(""),
    [expenseTitle, setExpenseTitle] = useState(""),
    [expenseAmount, setExpenseAmount] = useState(""),
    [menuName, setMenuName] = useState(""),
    [menuPrice, setMenuPrice] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      try {
        await createStaffAccountByUsername(username, password);
      } catch (error) {
        // An existing Firebase account can still have its staff role changed.
        // Do not abort before writing the role document in that case.
        if (!(error instanceof Error && error.message.includes("auth/email-already-in-use"))) {
          throw error;
        }
      }
      await setStaffRole(
        `${username.trim().toLowerCase().replace(/\s+/g, "-")}@staff.jackx.app`,
        role,
      );
      setSaved("تم حفظ المستخدم وصلاحيته بنجاح");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("staff account save failed", error);
      setSaved(
        error instanceof Error && error.message.includes("permission-denied")
          ? "تم إنشاء الحساب لكن لا تملك صلاحية حفظ الأدوار"
          : error instanceof Error && error.message.includes("auth/weak-password")
            ? "كلمة المرور يجب أن تكون 6 أحرف أو أكثر"
            : "تعذر حفظ المستخدم؛ تأكد من البيانات واتصال الإنترنت",
      );
    }
    setTimeout(() => setSaved(""), 3500);
  };
  const changeMode = async (mode: OperationMode) => {
    onOperationModeChange(mode);
    await saveOperationMode(mode);
  };
  const togglePayment = async (method: PaymentMethod) => {
    const next = paymentMethods.includes(method)
      ? paymentMethods.filter((item) => item !== method)
      : [...paymentMethods, method];
    if (!next.length) return;
    onPaymentMethodsChange(next);
    await savePaymentMethods(next);
  };
  const filteredCategories = categoryRecords.filter((item) => item.name.includes(settingsSearch) && (settingsFilter === "all" || (settingsFilter === "active" ? item.active : !item.active)));
  const filteredPayments = paymentRecords.filter((item) => item.name.includes(settingsSearch) && (settingsFilter === "all" || (settingsFilter === "active" ? item.active : !item.active)));
  const filteredOperations = operationRecords.filter((item) => item.name.includes(settingsSearch) && (settingsFilter === "all" || (settingsFilter === "active" ? item.active : !item.active)));
  const filteredStaff = staffRecords.filter((item) => `${item.username} ${item.email} ${item.phone}`.toLowerCase().includes(settingsSearch.toLowerCase()) && (settingsFilter === "all" || (settingsFilter === "active" ? item.active : !item.active)));
  const savePaymentRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDraft.name.trim()) return;
    const id = editingPayment || `payment-${Date.now()}`;
    const next = { id, ...paymentDraft, active: editingPayment ? paymentRecords.find((x) => x.id === id)?.active !== false : true };
    await savePaymentRecords(paymentRecords.some((x) => x.id === id) ? paymentRecords.map((x) => x.id === id ? next : x) : [...paymentRecords, next]);
    setPaymentDraft({ name: "", company: "", account: "", owner: "" });
    setEditingPayment(null);
    setSaved("تم حفظ طريقة الدفع");
  };
  const saveOperationRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationDraft.name.trim()) return;
    const id = editingOperation || operationDraft.id;
    const next = { id, name: operationDraft.name, active: editingOperation ? operationRecords.find((x) => x.id === id)?.active !== false : true };
    const records = operationRecords.some((x) => x.id === id) ? operationRecords.map((x) => x.id === id ? next : x) : [...operationRecords, next];
    await saveOperationRecords(records, operationMode);
    setOperationDraft({ id: "cashier", name: "" });
    setEditingOperation(null);
    setSaved("تم حفظ طريقة استقبال الطلب");
  };
  const toggleOperationRecord = async (item: OperationRecord) => {
    const records = operationRecords.map((x) => x.id === item.id ? { ...x, active: !x.active } : x);
    await saveOperationRecords(records, operationMode);
  };
  const togglePaymentRecord = async (item: PaymentRecord) => {
    const records = paymentRecords.map((x) => x.id === item.id ? { ...x, active: !x.active } : x);
    await savePaymentRecords(records);
    onPaymentMethodsChange(records.filter((x) => x.active).map((x) => x.id as PaymentMethod));
  };
  const saveStaffFromSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || (!editingStaff && !password)) return;
    const email = `${username.trim().toLowerCase().replace(/\s+/g, "-")}@staff.jackx.app`;
    if (!editingStaff) {
      try { await createStaffAccountByUsername(username, password); } catch (error) {
        if (!(error instanceof Error && error.message.includes("auth/email-already-in-use"))) throw error;
      }
    }
    await saveStaffRecord(email, { username: username.trim(), phone: staffPhone.trim() || "—", role, active: true });
    await setStaffRole(email, role);
    setUsername(""); setPassword(""); setStaffPhone(""); setEditingStaff(null);
    setSaved("تم حفظ المستخدم والصلاحية");
  };
  const toggleStaff = async (item: StaffRecord) => { await saveStaffRecord(item.email, { active: !item.active }); };
  const exportRows = (name: string, rows: unknown) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }));
    link.download = `jackx-${name}.json`; link.click(); URL.revokeObjectURL(link.href);
  };
  const saveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    await addExpense({ title: expenseTitle, amount: Number(expenseAmount) });
    setExpenseTitle("");
    setExpenseAmount("");
    setSaved("تم تسجيل المصروف");
    setTimeout(() => setSaved(""), 2500);
  };
  const saveNewMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName || !menuPrice) return;
    await saveMenuItem({
      id: `custom-${Date.now()}`,
      name: menuName,
      en: menuName,
      price: Number(menuPrice),
      cat: "إضافات",
      station: "bar",
      available: true,
    });
    setMenuName("");
    setMenuPrice("");
    setSaved("تمت إضافة الصنف للمنيو");
    setTimeout(() => setSaved(""), 2500);
  };
  const submitMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingMenu || !menuForm.name || !menuForm.en || !menuForm.price) return;
    setSavingMenu(true);
    try {
      const item = {
        ...menuForm,
        id: editingId || Date.now(),
        price: Number(menuForm.price),
        available: editingId
          ? menuItems.find((old) => old.id === editingId)?.available !== false
          : true,
      };
      await saveMenuItem(item);
      setMenuItems((items) =>
        uniqueProducts(
          editingId
            ? items.map((old) =>
                old.id === editingId ? (item as Product) : old,
              )
            : [...items, item as Product],
        ),
      );
      setMenuForm({
        name: "",
        en: "",
        img: "",
        price: "",
        cat: categories[0] || "قهوة",
        station: "bar",
        description: "",
      });
      setEditingId(null);
      setSaved("تم حفظ الصنف بنجاح");
    } catch (error) {
      console.error(error);
      setSaved("تعذر الحفظ. تأكد أن حسابك بصلاحية مدير وأن البيانات صحيحة");
    } finally {
      setSavingMenu(false);
    }
  };
  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    if (editingCategory && editingCategory !== name) {
      const affectedItems = menuItems.filter(
        (item) => item.cat === editingCategory,
      );
      await saveCategory(name);
      await Promise.all(
        affectedItems.map((item) => saveMenuItem({ ...item, cat: name })),
      );
      await deleteCategory(editingCategory);
      setCategories((items) =>
        items.map((item) => (item === editingCategory ? name : item)),
      );
      setMenuItems((items) =>
        items.map((item) =>
          item.cat === editingCategory ? { ...item, cat: name } : item,
        ),
      );
    } else {
      await saveCategory(name);
      setCategories((items) =>
        items.includes(name) ? items : [...items, name],
      );
    }
    setCategoryName("");
    setEditingCategory(null);
    setSaved("تم حفظ القسم بنجاح");
    setTimeout(() => setSaved(""), 2500);
  };
  const editCategory = (name: string) => {
    setEditingCategory(name);
    setCategoryName(name);
  };
  const removeCategory = async (name: string) => {
    if (categories.length <= 1) return;
    if (menuItems.some((item) => item.cat === name)) {
      setSaved("لا يمكن حذف قسم مرتبط بأصناف؛ عدّل الأصناف أولًا");
      setTimeout(() => setSaved(""), 3000);
      return;
    }
    await deleteCategory(name);
    setCategories((items) => items.filter((item) => item !== name));
    if (menuFilter === name) setMenuFilter("كل الأقسام");
    setSaved("تم حذف القسم");
    setTimeout(() => setSaved(""), 2500);
  };
  const editMenuItem = (item: Product) => {
    setEditingId(item.id);
    setMenuForm({
      name: item.name,
      en: item.en,
      img: item.img,
      price: String(item.price),
      cat: item.cat,
      station: item.station,
      description: item.description || "",
    });
    setActiveTab("menu");
  };
  const removeMenuItem = async (id: number) => {
    if (!window.confirm("حذف المنتج نهائيًا؟ استخدم إيقاف إذا كنت تريد إخفاءه مؤقتًا.")) return;
    try {
      await deleteMenuItem(id);
      setMenuItems((items) => items.filter((item) => item.id !== id));
      setSaved("تم حذف المنتج نهائيًا");
    } catch {
      setSaved("تعذر حذف المنتج؛ حاول مرة أخرى");
    }
    setTimeout(() => setSaved(""), 2500);
  };
  const toggleMenuAvailability = async (item: Product) => {
    const next = { ...item, available: item.available === false };
    try {
      await saveMenuItem(next);
      setMenuItems((items) => items.map((old) => old.id === item.id ? next : old));
      setSaved(next.available ? "تم تشغيل المنتج" : "تم إيقاف المنتج");
    } catch {
      setSaved("تعذر تغيير حالة المنتج؛ حاول مرة أخرى");
    }
    setTimeout(() => setSaved(""), 2500);
  };
  const exportMenu = () => {
    const blob = new Blob([JSON.stringify(menuItems, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jackx-menu.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const filteredMenu = menuItems
    .filter(
      (item) =>
        item.name.includes(menuSearch) ||
        item.en.toLowerCase().includes(menuSearch.toLowerCase()),
    )
    .filter((item) => menuFilter === "كل الأقسام" || item.cat === menuFilter);
  const customerRows = customerProfiles.map((customer) => {
    const customerOrders = orders.filter((order) => (order as Order & { userId?: string }).userId === customer.uid);
    const counts = new Map<string, { name: string; qty: number }>();
    let total = 0;
    customerOrders.forEach((order) => order.items?.forEach((item) => {
      total += item.price * item.qty;
      const current = counts.get(String(item.id)) || { name: item.en || item.name, qty: 0 };
      current.qty += item.qty;
      counts.set(String(item.id), current);
    }));
    const favorite = [...counts.values()].sort((a, b) => b.qty - a.qty)[0];
    return { ...customer, total, favorite: favorite?.name || "—" };
  });
  return (
    <main className={`admin tab-${activeTab}`} dir="rtl">
      <aside>
        <Logo />
        <h3>لوحة JACKX</h3>
        <button
          type="button"
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <LayoutDashboard /> نظرة عامة
        </button>
        <button
          type="button"
          className={activeTab === "menu" ? "active" : ""}
          onClick={() => setActiveTab("menu")}
        >
          <MenuIcon /> إدارة المنيو
        </button>
        <button
          type="button"
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          <ShoppingBag /> الطلبات
        </button>
        <button
          type="button"
          className={activeTab === "customers" ? "active" : ""}
          onClick={() => setActiveTab("customers")}
        >
          <UserRound /> العملاء
        </button>
        <button
          type="button"
          className={activeTab === "expenses" ? "active" : ""}
          onClick={() => setActiveTab("expenses")}
        >
          <Wallet /> المصروفات
        </button>
        <button
          type="button"
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          <Settings2 /> الإعدادات
        </button>
        <button className="staff-logout admin-logout" type="button" onClick={() => void logoutStaff()}>
          <LogOut size={17} /> تسجيل الخروج
        </button>
      </aside>
      <section>
        <header>
          <label>JACKX / ADMIN</label>
          <h1>
            {activeTab === "overview"
              ? "نظرة عامة"
              : activeTab === "menu"
                ? "إدارة المنيو"
              : activeTab === "orders"
                ? "الطلبات"
                : activeTab === "customers"
                  ? "العملاء المسجلون"
                : activeTab === "expenses"
                    ? "المصروفات"
                    : "الإعدادات"}
          </h1>
        </header>
        <div className="banner">
          <Zap /> خلّي يومك أخف، وإدارتك أذكى.
        </div>
        <div className="admincards">
          <div>
            <ShoppingBag /> إجمالي الطلبات <b>{orders.length}</b>
          </div>
          <div>
            <Receipt /> مبيعات اليوم <b>8,450 ج.م</b>
          </div>
          <div>
            <ChefHat /> أصناف المنيو <b>{menuItems.length}</b>
          </div>
          <div className="operation-card">
            ⚙️ وضع الطلبات{" "}
            <b>
              {operationMode === "cashier"
                ? "كاشير"
                : operationMode === "direct-screen"
                  ? "شاشات"
                  : "طابعة"}
            </b>
          </div>
        </div>
        <section className="table">
          <h2>آخر الطلبات</h2>
          {orders.map((o) => (
            <p key={o.id}>
              <b>{o.id}</b> {o.name}
              <span>
                {o.status === "new"
                  ? "جديد"
                  : o.status === "preparing"
                    ? "قيد التحضير"
                    : "جاهز"}
              </span>
            </p>
          ))}
        </section>
        <section className="table customer-panel">
          <div className="customer-section-head">
            <div>
              <h2>العملاء المسجلون</h2>
              <p>ملخص تعاملات العملاء الدائمين مع JACKX.</p>
            </div>
            <strong>{customerRows.length} عميل</strong>
          </div>
          <div className="menu-table-wrap">
            <table className="menu-table customer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم العميل</th>
                  <th>رقم الهاتف</th>
                  <th>إجمالي الإنفاق</th>
                  <th>الأكثر طلبًا</th>
                </tr>
              </thead>
              <tbody>
                {customerRows.length ? (
                  customerRows.map((customer, index) => (
                    <tr key={customer.uid}>
                      <td>{index + 1}</td>
                      <td>{customer.name || "—"}</td>
                      <td dir="ltr">{customer.phone || "—"}</td>
                      <td>{eg(customer.total)}</td>
                      <td>{customer.favorite}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      لا يوجد عملاء مسجلون حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="table menu-manager">
          <h2>إدارة المنيو</h2>
          <form className="menu-form" onSubmit={submitMenuItem}>
            <input
              required
              placeholder="اسم المنتج بالعربي"
              value={menuForm.name}
              onChange={(e) =>
                setMenuForm({ ...menuForm, name: e.target.value })
              }
            />
            <input
              required
              placeholder="Product name in English"
              value={menuForm.en}
              onChange={(e) => setMenuForm({ ...menuForm, en: e.target.value })}
            />
            <textarea
              className="menu-description"
              placeholder="وصف المنتج"
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
            />
            <input
              placeholder="رابط صورة المنتج"
              value={menuForm.img}
              onChange={(e) =>
                setMenuForm({ ...menuForm, img: e.target.value })
              }
            />
            <input
              required
              type="number"
              min="0"
              placeholder="السعر بالجنيه"
              value={menuForm.price}
              onChange={(e) =>
                setMenuForm({ ...menuForm, price: e.target.value })
              }
            />
            <select
              value={menuForm.cat}
              onChange={(e) =>
                setMenuForm({ ...menuForm, cat: e.target.value })
              }
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select
              value={menuForm.station}
              onChange={(e) =>
                setMenuForm({
                  ...menuForm,
                  station: e.target.value as "bar" | "kitchen",
                })
              }
            >
              <option value="bar">البار</option>
              <option value="kitchen">المطبخ</option>
            </select>
            <button className="btn" type="submit" disabled={savingMenu}>
              {savingMenu
                ? "جاري الحفظ..."
                : editingId
                  ? "حفظ التعديل"
                  : "إضافة المنتج"}
            </button>
          </form>
          <div className="menu-tools">
            <input
              placeholder="بحث باسم المنتج"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
            />
            <select
              value={menuFilter}
              onChange={(e) => setMenuFilter(e.target.value)}
            >
              <option>كل الأقسام</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <button type="button" onClick={exportMenu}>
              تصدير
            </button>
            <label className="import-button">
              استيراد
              <input
                hidden
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    file.text().then((text) => {
                      const items = JSON.parse(text) as Product[];
                      items.forEach((item) => void saveMenuItem(item));
                      setMenuItems(items);
                    });
                }}
              />
            </label>
          </div>
          <div className="menu-table-wrap">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>كود المنتج</th>
                  <th>اسم المنتج عربي</th>
                  <th>الاسم الإنجليزي</th>
                  <th>الوصف</th>
                  <th>الصورة</th>
                  <th>السعر</th>
                  <th>القسم</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenu.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>JX-{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.en}</td>
                    <td className="menu-description-cell">{item.description || "—"}</td>
                    <td>{item.img ? <img src={item.img} alt={item.en} loading="lazy" decoding="async" /> : "—"}</td>
                    <td>{eg(item.price)}</td>
                    <td>{item.cat}</td>
                    <td>
                      <button
                        type="button"
                        className={item.available === false ? "status-off" : "status-on"}
                        onClick={() => void toggleMenuAvailability(item)}
                      >
                        {item.available === false ? "تشغيل" : "إيقاف"}
                      </button>
                      <button type="button" onClick={() => editMenuItem(item)}>تعديل</button>
        <button
                        type="button"
                        className="danger"
                        onClick={() => void removeMenuItem(item.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="settings-premium">
          <div className="settings-toolbar">
            <input placeholder="بحث في الإعدادات..." value={settingsSearch} onChange={(e) => setSettingsSearch(e.target.value)} />
            <select value={settingsFilter} onChange={(e) => setSettingsFilter(e.target.value)}><option value="all">كل الحالات</option><option value="active">نشط فقط</option><option value="inactive">متوقف فقط</option></select>
            <button type="button" onClick={() => exportRows("settings", { categories: categoryRecords, payments: paymentRecords, operations: operationRecords, staff: staffRecords })}>تصدير</button>
            <button type="button" onClick={() => setSaved("الاستيراد متاح بصيغة JSON من نسخة النظام")}>استيراد</button>
          </div>
          <section className="settings-card">
            <div className="settings-card-head"><div><span className="eyebrow">MENU STRUCTURE</span><h2>إدارة أقسام المنيو</h2><p>تحكم في الأقسام التي تظهر عند إضافة المنتجات.</p></div><form onSubmit={submitCategory}><input placeholder="اسم القسم الجديد" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} /><button className="btn" type="submit">{editingCategory ? "حفظ التعديل" : "إضافة قسم جديد"}</button></form></div>
            <div className="settings-table-wrap"><table className="settings-table"><thead><tr><th>#</th><th>اسم القسم</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>{filteredCategories.map((item, i) => <tr key={item.id}><td>{i + 1}</td><td><b>{item.name}</b></td><td><button type="button" className={item.active ? "status-on" : "status-off"} onClick={() => void saveCategoryRecord({ ...item, active: !item.active })}>{item.active ? "نشط" : "متوقف"}</button></td><td><button type="button" onClick={() => editCategory(item.name)}>تعديل</button><button type="button" className="danger" onClick={() => void deleteCategoryRecord(item.id)}>حذف</button></td></tr>)}</tbody></table></div>
          </section>
          <section className="settings-card">
            <div className="settings-card-head"><div><span className="eyebrow">PAYMENT METHODS</span><h2>طرق الدفع</h2><p>الطرق النشطة فقط تظهر للعميل داخل السلة.</p></div><form onSubmit={savePaymentRecord}><input placeholder="طريقة الدفع" value={paymentDraft.name} onChange={(e) => setPaymentDraft({ ...paymentDraft, name: e.target.value })} /><input placeholder="اسم الشركة" value={paymentDraft.company} onChange={(e) => setPaymentDraft({ ...paymentDraft, company: e.target.value })} /><input placeholder="رقم الحساب" value={paymentDraft.account} onChange={(e) => setPaymentDraft({ ...paymentDraft, account: e.target.value })} /><input placeholder="اسم مالك الحساب" value={paymentDraft.owner} onChange={(e) => setPaymentDraft({ ...paymentDraft, owner: e.target.value })} /><button className="btn" type="submit">{editingPayment ? "حفظ التعديل" : "إضافة طريقة دفع"}</button></form></div>
            <div className="settings-table-wrap"><table className="settings-table"><thead><tr><th>#</th><th>طريقة الدفع</th><th>اسم الشركة</th><th>رقم الحساب</th><th>اسم مالك الحساب</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>{filteredPayments.map((item, i) => <tr key={item.id}><td>{i + 1}</td><td><b>{item.name}</b></td><td>{item.company}</td><td>{item.account}</td><td>{item.owner}</td><td><button type="button" className={item.active ? "status-on" : "status-off"} onClick={() => void togglePaymentRecord(item)}>{item.active ? "تشغيل" : "إيقاف"}</button></td><td><button type="button" onClick={() => { setEditingPayment(item.id); setPaymentDraft({ name: item.name, company: item.company, account: item.account, owner: item.owner }); }}>تعديل</button><button type="button" className="danger" onClick={() => void savePaymentRecords(paymentRecords.filter((x) => x.id !== item.id))}>حذف</button></td></tr>)}</tbody></table></div>
          </section>
          <section className="settings-card">
            <div className="settings-card-head"><div><span className="eyebrow">ORDER ROUTING</span><h2>طرق استقبال الطلبات</h2><p>اختر الطريقة الفعالة وسيتم تطبيقها على الطلبات الجديدة مباشرة.</p></div><form onSubmit={saveOperationRecord}><select value={operationDraft.id} onChange={(e) => setOperationDraft({ ...operationDraft, id: e.target.value as OperationMode })}><option value="cashier">الكاشير</option><option value="direct-screen">الشاشات</option><option value="direct-printer">الطابعة</option></select><input placeholder="اسم طريقة الاستقبال" value={operationDraft.name} onChange={(e) => setOperationDraft({ ...operationDraft, name: e.target.value })} /><button className="btn" type="submit">{editingOperation ? "حفظ التعديل" : "إضافة طريقة استقبال"}</button></form></div>
            <div className="settings-table-wrap"><table className="settings-table"><thead><tr><th>#</th><th>طريقة استقبال الطلب</th><th>الحالة</th><th>تفعيل</th><th>إجراءات</th></tr></thead><tbody>{filteredOperations.map((item, i) => <tr key={item.id}><td>{i + 1}</td><td><b>{item.name}</b></td><td><button type="button" className={item.active ? "status-on" : "status-off"} onClick={() => void toggleOperationRecord(item)}>{item.active ? "نشط" : "متوقف"}</button></td><td><button type="button" className={operationMode === item.id ? "route-selected" : "route-button"} disabled={!item.active} onClick={() => { onOperationModeChange(item.id); void saveOperationRecords(operationRecords, item.id); }}>{operationMode === item.id ? "مفعلة الآن" : "تفعيل"}</button></td><td><button type="button" onClick={() => { setEditingOperation(item.id); setOperationDraft({ id: item.id, name: item.name }); }}>تعديل</button><button type="button" className="danger" onClick={() => void saveOperationRecords(operationRecords.filter((x) => x.id !== item.id), operationMode === item.id ? "cashier" : operationMode)}>حذف</button></td></tr>)}</tbody></table></div>
          </section>
          <section className="settings-card">
            <div className="settings-card-head"><div><span className="eyebrow">TEAM ACCESS</span><h2>إدارة المستخدمين والصلاحيات</h2><p>الصلاحيات والحالة تُحفظ من هنا مباشرة. كلمات المرور لا تُعرض لأسباب أمنية.</p></div><form onSubmit={saveStaffFromSettings}><input placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} required /><input placeholder="رقم الهاتف" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} /><input type={showPassword ? "text" : "password"} placeholder={editingStaff ? "كلمة مرور جديدة اختيارية" : "كلمة المرور"} minLength={editingStaff ? undefined : 6} required={!editingStaff} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}</button><select value={role} onChange={(e) => setRole(e.target.value)}><option value="cashier">كاشير</option><option value="admin">مدير</option></select><button className="btn" type="submit">{editingStaff ? "حفظ تعديل المستخدم" : "إضافة مستخدم جديد"}</button></form></div>
            <div className="settings-table-wrap"><table className="settings-table"><thead><tr><th>#</th><th>اسم المستخدم</th><th>رقم الهاتف</th><th>البريد</th><th>الباسورد</th><th>الصلاحية</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>{filteredStaff.map((item, i) => <tr key={item.id}><td>{i + 1}</td><td><b>{item.username}</b></td><td>{item.phone}</td><td>{item.email}</td><td>••••••••</td><td><span className="role-badge">{item.role === "admin" || item.role === "مدير" ? "مدير" : "كاشير"}</span></td><td><button type="button" className={item.active ? "status-on" : "status-off"} onClick={() => void toggleStaff(item)}>{item.active ? "تشغيل" : "إيقاف"}</button></td><td><button type="button" onClick={() => { setEditingStaff(item.email); setUsername(item.username); setStaffPhone(item.phone === "—" ? "" : item.phone); setRole(item.role); }}>تعديل</button><button type="button" className="danger" onClick={() => void deleteStaffRecord(item.email)}>حذف</button></td></tr>)}</tbody></table></div>
          </section>
          {saved && <div className="settings-toast">{saved}</div>}
        </section>
        <section className="table staff-panel legacy-settings">
          <h2>إدارة أقسام المنيو</h2>
          <p>
            أضف الأقسام أو عدّلها أو احذفها. ستظهر الأقسام هنا تلقائيًا في قائمة
            إضافة المنتج.
          </p>
          <form className="category-form" onSubmit={submitCategory}>
            <input
              required
              placeholder="اسم القسم"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button className="btn" type="submit">
              {editingCategory ? "حفظ تعديل القسم" : "إضافة قسم"}
            </button>
            {editingCategory && (
        <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName("");
                }}
              >
                إلغاء
              </button>
            )}
          </form>
          <div className="category-list">
            {categories.map((category) => (
              <div key={category}>
                <span>{category}</span>
                <span>
                  <button type="button" onClick={() => editCategory(category)}>
                    تعديل
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void removeCategory(category)}
                  >
                    حذف
                  </button>
                </span>
              </div>
            ))}
          </div>
          <hr />
          <h2>طرق الدفع المتاحة</h2>
          <p>اختار طرق الدفع التي تظهر للعميل عند تأكيد الطلب.</p>
          <div className="payment-settings">
            {(["cash", "card", "wallet"] as PaymentMethod[]).map((method) => (
              <label key={method}>
                <input
                  type="checkbox"
                  checked={paymentMethods.includes(method)}
                  onChange={() => void togglePayment(method)}
                />
                {method === "cash"
                  ? "نقدي"
                  : method === "card"
                    ? "فيزا / كارت"
                    : "محفظة إلكترونية"}
              </label>
            ))}
          </div>
          <hr />
          <h2>إدارة المنيو</h2>
          <form onSubmit={saveNewMenuItem}>
            <input
              required
              placeholder="اسم الصنف"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="السعر"
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
            />
            <button className="btn" type="submit">
              إضافة صنف
            </button>
          </form>
          <hr />
          <h2>المصروفات</h2>
          <form onSubmit={saveExpense}>
            <input
              required
              placeholder="بيان المصروف"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="القيمة بالجنيه"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
            />
            <button className="btn" type="submit">
              إضافة مصروف
            </button>
          </form>
          <hr />
          <h2>طريقة استقبال الطلبات</h2>
          <p>
            حدد هل الطلب يمر على الكاشير أولًا، أو يذهب مباشرة للشاشات أو
            الطابعة.
          </p>
          <select
            className="operation-select"
            value={operationMode}
            onChange={(e) => void changeMode(e.target.value as OperationMode)}
          >
            <option value="cashier">الكاشير أولًا ثم التوجيه</option>
            <option value="direct-screen">
              إرسال مباشر لشاشات البار والمطبخ
            </option>
            <option value="direct-printer">إرسال مباشر للطابعة</option>
          </select>
          <hr />
          <h2>إنشاء مستخدم وصلاحياته</h2>
          <p>أنشئ حساب الموظف من هنا مباشرة، ثم حدد هل هو كاشير أو مدير.</p>
          <form onSubmit={save}>
            <input
              type="text"
              required
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type={showPassword ? "text" : "password"}
              minLength={6}
              required
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            </button>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="cashier">كاشير</option>
              <option value="admin">مدير</option>
            </select>
            <button className="btn" type="submit">
              إنشاء وحفظ
            </button>
          </form>
          {saved && <small>{saved}</small>}
        </section>
      </section>
    </main>
  );
}
function App() {
  const [orders, setOrders] = useState<Order[]>([]),
    [loggedIn, setLoggedIn] = useState(false),
    [operationMode, setOperationMode] = useState<OperationMode>("cashier");
  const [menuItems, setMenuItems] = useState<Product[] | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    "cash",
    "card",
  ]);
  const view =
    new URLSearchParams(location.search).get("view") ||
    (location.pathname.includes("cashier")
      ? "cashier"
      : location.pathname.includes("admin")
        ? "admin"
        : "client");
  useEffect(() => {
    if (view === "client" || !loggedIn) return;
    const watch = view === "admin" ? watchAllOrders : watchOrders;
    return watch((next) => setOrders(next as Order[]), console.error);
  }, [view, loggedIn]);
  useEffect(() => {
    loadPaymentMethods().then(setPaymentMethods).catch(console.error);
  }, []);
  useEffect(
    () =>
      watchMenu((items) => {
        setMenuItems(uniqueProducts(items as Product[]));
      }, console.error),
    [],
  );
  useEffect(() => {
    if (view === "client" || !loggedIn) return;
    loadOperationMode().then(setOperationMode).catch(console.error);
  }, [view, loggedIn]);
  const add = async (o: Order) => {
    const saved = { ...o, userId: auth.currentUser?.uid || "" };
    setOrders((x) => [o, ...x]);
    try {
      await createOrder(saved as unknown as Record<string, unknown>);
    } catch (error) {
      console.error(error);
    }
  };
  if (view !== "client" && !loggedIn)
    return <StaffLogin onLogin={() => setLoggedIn(true)} />;
  if (view === "cashier")
    return (
      <Cashier
        orders={orders}
        setOrders={setOrders}
        operationMode={operationMode}
      />
    );
  if (view === "admin")
    return (
      <Admin
        orders={orders}
        operationMode={operationMode}
        onOperationModeChange={setOperationMode}
        paymentMethods={paymentMethods}
        onPaymentMethodsChange={setPaymentMethods}
      />
    );
  return (
    <>
      <Client
        addOrder={add}
        paymentMethods={paymentMethods}
        menuItems={menuItems}
      />
      <CustomerPortal menuItems={menuItems} />
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
