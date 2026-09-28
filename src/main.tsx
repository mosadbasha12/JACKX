import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  Bell,
  Check,
  ChefHat,
  Clock3,
  Coffee,
  LayoutDashboard,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
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
  loadOperationMode,
  loadPaymentMethods,
  loginCustomer,
  loginStaffByUsername,
  registerCustomer,
  saveMenuItem,
  saveOperationMode,
  savePaymentMethods,
  setStaffRole,
  updateOrder,
  watchCustomerOrders,
  watchOrders,
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
const P: Product[] = [
  {
    id: 1,
    name: "سبانيش لاتيه",
    en: "Spanish Latte",
    price: 95,
    cat: "قهوة",
    img: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=85",
    station: "bar",
  },
  {
    id: 2,
    name: "آيس وايت موكا",
    en: "Iced White Mocha",
    price: 115,
    cat: "مشروبات باردة",
    img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85",
    station: "bar",
  },
  {
    id: 3,
    name: "كرواسون بندق",
    en: "Hazelnut Croissant",
    price: 85,
    cat: "فطور",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",
    station: "kitchen",
  },
  {
    id: 4,
    name: "ماتشا لاتيه",
    en: "Matcha Latte",
    price: 120,
    cat: "مشروبات باردة",
    img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=85",
    station: "bar",
  },
  {
    id: 5,
    name: "بان كيك جاك",
    en: "Jack Pancakes",
    price: 145,
    cat: "فطور",
    img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85",
    station: "kitchen",
  },
  {
    id: 6,
    name: "تشيز كيك التوت",
    en: "Berry Cheesecake",
    price: 135,
    cat: "حلويات",
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=85",
    station: "kitchen",
  },
];
const cats = ["كل الأصناف", "قهوة", "مشروبات باردة", "فطور", "حلويات"];
const eg = (n: number) => `${n} ج.م`;
const seed: Order[] = [
  {
    id: "#JX-1048",
    type: "dinein",
    name: "أحمد محمد",
    phone: "01012345678",
    table: "12",
    payment: "نقدي",
    items: [
      { ...P[0], qty: 2 },
      { ...P[5], qty: 1 },
    ],
    status: "new",
  },
  {
    id: "#JX-1047",
    type: "delivery",
    name: "سارة علي",
    phone: "01198765432",
    address: "التجمع الخامس",
    payment: "فيزا",
    items: [{ ...P[1], qty: 1 }],
    status: "preparing",
  },
];
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
function CustomerPortal() {
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
                    {P.map((p) => (
                      <button
                        className="favorite-row"
                        key={p.id}
                        onClick={() => toggle(p.id)}
                      >
                        <img src={p.img} />
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
function Client({ addOrder, paymentMethods }: { addOrder: (o: Order) => void; paymentMethods: PaymentMethod[] }) {
  const [cat, setCat] = useState("كل الأصناف"),
    [q, setQ] = useState(""),
    [cart, setCart] = useState<Line[]>([]),
    [modal, setModal] = useState<Product | null>(null),
    [checkout, setCheckout] = useState<"delivery" | "dinein" | null>(null),
    [notice, setNotice] = useState("");
  const [customerUid, setCustomerUid] = useState(auth.currentUser?.uid || "");
  useEffect(() => {
    const sync = () => setCustomerUid(auth.currentUser?.uid || "");
    window.addEventListener("jackx-customer-changed", sync);
    return () => window.removeEventListener("jackx-customer-changed", sync);
  }, []);
  const add = (p: Product) =>
    setCart((c) =>
      c.some((x) => x.id === p.id)
        ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...p, qty: 1 }],
    );
  const list = P.filter(
    (p) =>
      (cat === "كل الأصناف" || p.cat === cat) &&
      `${p.name}${p.en}`.toLowerCase().includes(q.toLowerCase()),
  );
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
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
        <div className="links">
          <a href="#menu">المنيو</a>
          <a href="#story">عن JACKX</a>
          <a href="#visit">زورنا</a>
          <a href="https://jackx.scorpion.ddnsfree.com" target="_blank" rel="noreferrer">الموقع الرئيسي</a>
        </div>
        <button
          className="cart"
          onClick={() => setModal({ ...P[0], id: -1, name: "السلة" })}
        >
          <ShoppingBag size={18} /> السلة{" "}
          {cart.length > 0 && <b>{cart.reduce((s, x) => s + x.qty, 0)}</b>}
        </button>
      </nav>
      <section className="hero">
        <div>
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
        <div className="hero-img">
          <img src={P[0].img} />
          <span>
            طازج كل يوم
            <br />
            <small>made with love</small>
          </span>
        </div>
      </section>
      <section id="menu" className="menu">
        <header>
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
        <div className="cats">
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
          {list.map((p) => (
            <article key={p.id}>
              <img src={p.img} />
              <button className="plus" onClick={() => add(p)}>
                <Plus />
              </button>
              <div>
                <small>{p.en}</small>
                <h3>{p.name}</h3>
                <strong>{eg(p.price)}</strong>
                <button className="order" onClick={() => setModal(p)}>
                  اطلبه دلوقتي <ArrowLeft size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="story" className="story">
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
                <img src={modal.img} />
                <div className="pad">
                  <label>{modal.en}</label>
                  <h2>{modal.name}</h2>
                  <p>اختيار JACKX المميز بطعم طازج وتجربة مختلفة.</p>
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
              {!customerUid && <><input name="name" required placeholder="الاسم" /><input name="phone" required placeholder="رقم الموبايل" /></>}
              {checkout === "delivery" ? (
                <input name="address" required placeholder="العنوان" />
              ) : (
                <input name="table" required placeholder="رقم الترابيزة" />
              )}
              {!customerUid && <select name="payment">{paymentMethods.map((method) => <option key={method} value={method}>{method === "cash" ? "نقدي" : method === "card" ? "فيزا / كارت" : "محفظة إلكترونية"}</option>)}</select>}
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
      try { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = 880; gain.gain.value = 0.08; osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.18); } catch { /* browser may block audio until interaction */ }
      if ("Notification" in window && Notification.permission === "granted") new Notification("طلب JACKX جديد", { body: "يوجد طلب جديد يحتاج المراجعة" });
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
      </header>
      <section className="dashbody">
        <label>JACKX / CASHIER</label>
          <h1>الطلبات الحالية</h1>
          <p className="mode-pill">وضع التشغيل: {operationMode === "cashier" ? "الكاشير أولًا" : operationMode === "direct-screen" ? "شاشات مباشرة" : "طباعة مباشرة"}</p>
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
function Admin({ orders, operationMode, onOperationModeChange, paymentMethods, onPaymentMethodsChange }: { orders: Order[]; operationMode: OperationMode; onOperationModeChange: (mode: OperationMode) => void; paymentMethods: PaymentMethod[]; onPaymentMethodsChange: (methods: PaymentMethod[]) => void }) {
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
      await createStaffAccountByUsername(username, password);
      await setStaffRole(`${username.trim().toLowerCase().replace(/\s+/g, "-")}@staff.jackx.app`, role);
      setSaved("تم إنشاء المستخدم وحفظ صلاحيته بنجاح");
      setUsername("");
      setPassword("");
    } catch (error) {
      setSaved(
        error instanceof Error && error.message.includes("already")
              ? "اسم المستخدم موجود بالفعل، غيّره أو عدّل صلاحيته"
              : "تعذر إنشاء المستخدم؛ تأكد من الاسم وكلمة المرور",
      );
    }
    setTimeout(() => setSaved(""), 3500);
  };
  const changeMode = async (mode: OperationMode) => { onOperationModeChange(mode); await saveOperationMode(mode); };
  const togglePayment = async (method: PaymentMethod) => { const next = paymentMethods.includes(method) ? paymentMethods.filter((item) => item !== method) : [...paymentMethods, method]; if (!next.length) return; onPaymentMethodsChange(next); await savePaymentMethods(next); };
  const saveExpense = async (e: React.FormEvent) => { e.preventDefault(); if (!expenseTitle || !expenseAmount) return; await addExpense({ title: expenseTitle, amount: Number(expenseAmount) }); setExpenseTitle(""); setExpenseAmount(""); setSaved("تم تسجيل المصروف"); setTimeout(() => setSaved(""), 2500); };
  const saveNewMenuItem = async (e: React.FormEvent) => { e.preventDefault(); if (!menuName || !menuPrice) return; await saveMenuItem({ id: `custom-${Date.now()}`, name: menuName, en: menuName, price: Number(menuPrice), cat: "إضافات", station: "bar", available: true }); setMenuName(""); setMenuPrice(""); setSaved("تمت إضافة الصنف للمنيو"); setTimeout(() => setSaved(""), 2500); };
  return (
    <main className="admin" dir="rtl">
      <aside>
        <Logo />
        <h3>لوحة JACKX</h3>
        <button className="active">
          <LayoutDashboard /> نظرة عامة
        </button>
        <button>
          <MenuIcon /> إدارة المنيو
        </button>
        <button>
          <ShoppingBag /> الطلبات
        </button>
        <button>
          <Wallet /> المصروفات
        </button>
      </aside>
      <section>
        <header>
          <label>JACKX / ADMIN</label>
          <h1>نظرة عامة</h1>
        </header>
        <div className="banner">
          <Zap /> خلّي يومك أخف، وإدارتك أذكى.
        </div>
        <div className="admincards">
          <div>
            <ShoppingBag /> إجمالي الطلبات <b>{orders.length + 126}</b>
          </div>
          <div>
            <Receipt /> مبيعات اليوم <b>8,450 ج.م</b>
          </div>
          <div>
            <ChefHat /> أصناف المنيو <b>{P.length}</b>
          </div>
          <div className="operation-card">
            ⚙️ وضع الطلبات <b>{operationMode === "cashier" ? "كاشير" : operationMode === "direct-screen" ? "شاشات" : "طابعة"}</b>
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
        <section className="table staff-panel">
          <h2>طرق الدفع المتاحة</h2>
          <p>اختار طرق الدفع التي تظهر للعميل عند تأكيد الطلب.</p>
          <div className="payment-settings">{(["cash", "card", "wallet"] as PaymentMethod[]).map((method) => <label key={method}><input type="checkbox" checked={paymentMethods.includes(method)} onChange={() => void togglePayment(method)} />{method === "cash" ? "نقدي" : method === "card" ? "فيزا / كارت" : "محفظة إلكترونية"}</label>)}</div>
          <hr />
          <h2>إدارة المنيو</h2>
          <form onSubmit={saveNewMenuItem}><input required placeholder="اسم الصنف" value={menuName} onChange={(e) => setMenuName(e.target.value)} /><input required type="number" min="0" placeholder="السعر" value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} /><button className="btn" type="submit">إضافة صنف</button></form>
          <hr />
          <h2>المصروفات</h2>
          <form onSubmit={saveExpense}><input required placeholder="بيان المصروف" value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} /><input required type="number" min="0" placeholder="القيمة بالجنيه" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} /><button className="btn" type="submit">إضافة مصروف</button></form>
          <hr />
          <h2>طريقة استقبال الطلبات</h2>
          <p>حدد هل الطلب يمر على الكاشير أولًا، أو يذهب مباشرة للشاشات أو الطابعة.</p>
          <select className="operation-select" value={operationMode} onChange={(e) => void changeMode(e.target.value as OperationMode)}>
            <option value="cashier">الكاشير أولًا ثم التوجيه</option>
            <option value="direct-screen">إرسال مباشر لشاشات البار والمطبخ</option>
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
            <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}</button>
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
  const [orders, setOrders] = useState<Order[]>(seed),
    [loggedIn, setLoggedIn] = useState(false),
    [operationMode, setOperationMode] = useState<OperationMode>("cashier");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(["cash", "card"]);
  const view =
    new URLSearchParams(location.search).get("view") ||
    (location.pathname.includes("cashier")
      ? "cashier"
      : location.pathname.includes("admin")
        ? "admin"
        : "client");
  useEffect(() => {
    if (view === "client" || !loggedIn) return;
    return watchOrders((next) => {
      if (next.length) setOrders(next as Order[]);
    }, console.error);
  }, [view, loggedIn]);
  useEffect(() => { loadPaymentMethods().then(setPaymentMethods).catch(console.error); }, []);
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
    return <Cashier orders={orders} setOrders={setOrders} operationMode={operationMode} />;
  if (view === "admin") return <Admin orders={orders} operationMode={operationMode} onOperationModeChange={setOperationMode} paymentMethods={paymentMethods} onPaymentMethodsChange={setPaymentMethods} />;
  return (
    <>
      <Client addOrder={add} paymentMethods={paymentMethods} />
      <FavoriteHearts />
      <CustomerPortal />
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
function FavoriteHearts() {
  useEffect(() => {
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>(".grid article .plus"),
    ];
    buttons.forEach((button, index) => {
      if (button.parentElement?.querySelector(".favorite-card")) return;
      const fav = document.createElement("button");
      fav.className = "favorite-card";
      fav.textContent = JSON.parse(
        localStorage.getItem("jackx-favorites") || "[]",
      ).includes(P[index]?.id)
        ? "♥"
        : "♡";
      fav.onclick = () => {
        const old = JSON.parse(localStorage.getItem("jackx-favorites") || "[]");
        const id = P[index]?.id;
        const next = old.includes(id)
          ? old.filter((x: number) => x !== id)
          : [...old, id];
        localStorage.setItem("jackx-favorites", JSON.stringify(next));
        fav.textContent = next.includes(id) ? "♥" : "♡";
      };
      button.parentElement?.appendChild(fav);
    });
    return () =>
      buttons.forEach((button) =>
        button.parentElement?.querySelector(".favorite-card")?.remove(),
      );
  }, []);
  return null;
}
