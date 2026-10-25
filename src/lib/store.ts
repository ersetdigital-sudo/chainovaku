export type OrderLine = [string, string];

export type Order = {
  ok: boolean;
  slug: string;
  service: string;
  product: string;
  price: number;
  admin: number;
  lines: OrderLine[];
  type: "prepaid" | "game" | "bill";
};

export type SavedOrder = {
  inv: string;
  status: "pending" | "processing" | "success";
  service: string;
  product: string;
  lines: OrderLine[];
  method: string;
  total: number;
  contact: string;
  sn: string;
  label: string;
  created: number;
  updated: number;
  paidAt?: number;
};

const ORDER_KEY = "chainovaku_order";
const ORDERS_KEY = "chainovaku_orders";

export function loadOrder(): Order | null {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

export function saveOrder(order: Order) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    /* storage unavailable */
  }
}

export function clearOrder() {
  try {
    localStorage.removeItem(ORDER_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function loadOrders(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as SavedOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: SavedOrder[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 30)));
  } catch {
    /* storage unavailable */
  }
}

export const QRIS_IMAGE =
  "https://res.cloudinary.com/dqjh7utdb/image/upload/v1792161327/camhvfeu1lcm0ps8ieiz.jpg";

export const ADMIN_WHATSAPP = "https://wa.me/6285711172317";
export const ADMIN_WHATSAPP_DISPLAY = "085711172317";
