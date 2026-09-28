import { getApp, getApps, initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
const config = {
  apiKey: "AIzaSyBWhYhDuV8CAVYz33f0udYppgypp2phUew",
  authDomain: "jackx-1a9d9.firebaseapp.com",
  projectId: "jackx-1a9d9",
  storageBucket: "jackx-1a9d9.firebasestorage.app",
  messagingSenderId: "332749297524",
  appId: "1:332749297524:web:836f9623bf408dd1463e21",
};
const app = getApps().length ? getApp() : initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
const customerEmail = (phone: string) =>
  `${phone.replace(/\D/g, "")}@customer.jackx.app`;
export const loginStaff = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
export const registerCustomer = (
  phone: string,
  password: string,
  name: string,
) =>
  createUserWithEmailAndPassword(auth, customerEmail(phone), password).then(
    (c) =>
      setDoc(
        doc(db, "customers", c.user.uid),
        {
          uid: c.user.uid,
          name,
          phone,
          createdAt: serverTimestamp(),
          favorites: [],
        },
        { merge: true },
      ),
  );
export const loginCustomer = (phone: string, password: string) =>
  signInWithEmailAndPassword(auth, customerEmail(phone), password);
export const setStaffRole = (email: string, role: string) =>
  setDoc(
    doc(db, "staff", email.toLowerCase()),
    { email: email.toLowerCase(), role, updatedAt: serverTimestamp() },
    { merge: true },
  );
export const createOrder = (order: Record<string, unknown>) =>
  addDoc(collection(db, "orders"), { ...order, createdAt: serverTimestamp() });
export const watchOrders = (
  onChange: (orders: any[]) => void,
  onError: (e: Error) => void,
) =>
  onSnapshot(
    query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)),
    (s) => onChange(s.docs.map((d) => ({ docId: d.id, ...d.data() }))),
    onError,
  );
export const watchCustomerOrders = (
  uid: string,
  onChange: (orders: any[]) => void,
  onError: (e: Error) => void,
) =>
  onSnapshot(
    query(
      collection(db, "orders"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100),
    ),
    (s) => onChange(s.docs.map((d) => ({ docId: d.id, ...d.data() }))),
    onError,
  );
export const updateOrder = (docId: string, status: string) =>
  updateDoc(doc(db, "orders", docId), { status, updatedAt: serverTimestamp() });
export type OperationMode = "cashier" | "direct-screen" | "direct-printer";
export const loadOperationMode = async (): Promise<OperationMode> => {
  const snapshot = await getDoc(doc(db, "settings", "operations"));
  return (snapshot.data()?.mode as OperationMode) || "cashier";
};
export const saveOperationMode = (mode: OperationMode) =>
  setDoc(doc(db, "settings", "operations"), { mode, updatedAt: serverTimestamp() }, { merge: true });
export type PaymentMethod = "cash" | "card" | "wallet";
export const loadPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const snapshot = await getDoc(doc(db, "settings", "payments"));
  return (snapshot.data()?.methods as PaymentMethod[]) || ["cash", "card"];
};
export const savePaymentMethods = (methods: PaymentMethod[]) =>
  setDoc(doc(db, "settings", "payments"), { methods, updatedAt: serverTimestamp() }, { merge: true });
export const addExpense = (expense: { title: string; amount: number; note?: string }) =>
  addDoc(collection(db, "expenses"), { ...expense, createdAt: serverTimestamp() });
export const saveMenuItem = (item: Record<string, unknown>) =>
  setDoc(doc(db, "menu", String(item.id)), item, { merge: true });
export const watchMenu = (onChange: (items: any[]) => void, onError: (error: Error) => void) =>
  onSnapshot(collection(db, "menu"), (snapshot) => onChange(snapshot.docs.map((item) => item.data())), onError);
export const saveCategory = (name: string) => setDoc(doc(db, "categories", name), { name, updatedAt: serverTimestamp() }, { merge: true });
export const watchCategories = (onChange: (categories: string[]) => void, onError: (error: Error) => void) =>
  onSnapshot(collection(db, "categories"), (snapshot) => onChange(snapshot.docs.map((item) => String(item.data().name))), onError);
export const deleteMenuItem = (id: string | number) =>
  updateDoc(doc(db, "menu", String(id)), { available: false, updatedAt: serverTimestamp() });
export const createStaffAccount = async (email: string, password: string) => {
  const secondary =
    getApps().find((x) => x.name === "staffCreator") ||
    initializeApp(config, "staffCreator");
  const secondaryAuth = getAuth(secondary);
  const result = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    password,
  );
  await signOut(secondaryAuth);
  return result.user.uid;
};
const staffEmail = (username: string) =>
  `${username.trim().toLowerCase().replace(/\s+/g, "-")}@staff.jackx.app`;
export const loginStaffByUsername = (username: string, password: string) =>
  signInWithEmailAndPassword(auth, username.includes("@") ? username.trim().toLowerCase() : staffEmail(username), password);
export const createStaffAccountByUsername = async (
  username: string,
  password: string,
) => {
  const secondary =
    getApps().find((x) => x.name === "staffCreator") ||
    initializeApp(config, "staffCreator");
  const secondaryAuth = getAuth(secondary);
  const result = await createUserWithEmailAndPassword(
    secondaryAuth,
    staffEmail(username),
    password,
  );
  await signOut(secondaryAuth);
  return result.user.uid;
};
