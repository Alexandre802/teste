"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import {
  ProfessionalPaymentDonut,
  ProfessionalSalesChart,
  type PaymentChartPoint,
  type SalesChartPoint,
} from "@/components/caixa/remotion-finance-charts";

const SUPABASE_URL = "https://qtxcqlzfqfckcjpeboeo.supabase.co";
const SUPABASE_KEY = "sb_publishable_TWIxTBn8_aWmtlX3xnvLNA_9ZthmAiz";
const STORAGE_KEY = "comida_caseira_caixa_token";

const clientFor = (token: string) =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { headers: { "x-comida-caseira-admin-token": token } },
  });

type ChartOrder = {
  created_at: string;
  status: string;
  total_cents: number;
};

type ChartRevenue = {
  payment_method: string;
  amount_cents: number;
};

const emptyPayments: PaymentChartPoint[] = [
  { name: "PIX", color: "#2563eb", value: 0 },
  { name: "Dinheiro", color: "#22c55e", value: 0 },
  { name: "Débito", color: "#f59e0b", value: 0 },
  { name: "Crédito", color: "#ef4444", value: 0 },
];

export default function CaixaTemplate({ children }: { children: ReactNode }) {
  const [salesTarget, setSalesTarget] = useState<HTMLElement | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<HTMLElement | null>(null);
  const [salesData, setSalesData] = useState<SalesChartPoint[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentChartPoint[]>(emptyPayments);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);

  const loadChartData = useCallback(async (force = false) => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token || loadingRef.current) return;
    if (!force && Date.now() - lastLoadRef.current < 8_000) return;

    loadingRef.current = true;
    try {
      const supabase = clientFor(token);
      const [ordersResult, revenuesResult] = await Promise.all([
        supabase
          .from("comida_caseira_orders")
          .select("created_at,status,total_cents")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase
          .from("comida_caseira_revenues")
          .select("payment_method,amount_cents")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const orders = (ordersResult.data || []) as ChartOrder[];
      const revenues = (revenuesResult.data || []) as ChartRevenue[];

      const line = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const dayKey = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(date);

        const amount = orders
          .filter((order) => order.created_at.slice(0, 10) === dayKey && order.status !== "cancelled")
          .reduce((sum, order) => sum + Number(order.total_cents || 0), 0);

        return {
          day: new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            timeZone: "America/Sao_Paulo",
          }).format(date),
          value: amount / 100,
        };
      });

      const payment = [
        {
          name: "PIX",
          color: "#2563eb",
          value: revenues.filter((item) => item.payment_method === "pix").reduce((sum, item) => sum + Number(item.amount_cents || 0), 0),
        },
        {
          name: "Dinheiro",
          color: "#22c55e",
          value: revenues.filter((item) => item.payment_method === "cash").reduce((sum, item) => sum + Number(item.amount_cents || 0), 0),
        },
        {
          name: "Débito",
          color: "#f59e0b",
          value: revenues.filter((item) => item.payment_method === "debit").reduce((sum, item) => sum + Number(item.amount_cents || 0), 0),
        },
        {
          name: "Crédito",
          color: "#ef4444",
          value: revenues.filter((item) => item.payment_method === "credit").reduce((sum, item) => sum + Number(item.amount_cents || 0), 0),
        },
      ];

      setSalesData(line);
      setPaymentData(payment);
      lastLoadRef.current = Date.now();
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const created: HTMLElement[] = [];
    const hidden: HTMLElement[] = [];

    const installTargets = () => {
      const sections = Array.from(document.querySelectorAll("section"));

      const salesSection = sections.find(
        (section) => section.querySelector("h2")?.textContent?.trim() === "Vendas",
      ) as HTMLElement | undefined;

      if (salesSection) {
        const original = salesSection.children[1] as HTMLElement | undefined;
        let target = salesSection.querySelector<HTMLElement>("[data-remotion-sales-chart]");
        if (original && !original.hasAttribute("data-remotion-sales-chart")) {
          if (!target) {
            target = document.createElement("div");
            target.setAttribute("data-remotion-sales-chart", "true");
            target.style.width = "100%";
            target.style.height = "260px";
            target.style.overflow = "hidden";
            target.style.borderRadius = "16px";
            salesSection.insertBefore(target, original);
            created.push(target);
          }
          if (original.style.display !== "none") {
            original.dataset.remotionPreviousDisplay = original.style.display;
            original.style.display = "none";
            hidden.push(original);
          }
          setSalesTarget((current) => (current === target ? current : target));
        }
      } else {
        setSalesTarget(null);
      }

      const paymentSection = sections.find(
        (section) => section.querySelector("h2")?.textContent?.trim() === "Formas de pagamento",
      ) as HTMLElement | undefined;

      if (paymentSection) {
        const grid = paymentSection.children[1] as HTMLElement | undefined;
        const original = grid?.children[0] as HTMLElement | undefined;
        let target = grid?.querySelector<HTMLElement>("[data-remotion-payment-chart]") || null;
        if (grid && original && !original.hasAttribute("data-remotion-payment-chart")) {
          if (!target) {
            target = document.createElement("div");
            target.setAttribute("data-remotion-payment-chart", "true");
            target.style.width = "100%";
            target.style.maxWidth = "180px";
            target.style.height = "170px";
            target.style.margin = "0 auto";
            target.style.overflow = "hidden";
            target.style.borderRadius = "999px";
            grid.insertBefore(target, original);
            created.push(target);
          }
          if (original.style.display !== "none") {
            original.dataset.remotionPreviousDisplay = original.style.display;
            original.style.display = "none";
            hidden.push(original);
          }
          setPaymentTarget((current) => (current === target ? current : target));
        }
      } else {
        setPaymentTarget(null);
      }

      if (salesSection || paymentSection) void loadChartData();
    };

    installTargets();

    const observer = new MutationObserver(() => installTargets());
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadChartData(true);
    }, 30_000);

    const onFocus = () => void loadChartData(true);
    window.addEventListener("focus", onFocus);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      created.forEach((node) => node.remove());
      hidden.forEach((node) => {
        node.style.display = node.dataset.remotionPreviousDisplay || "";
        delete node.dataset.remotionPreviousDisplay;
      });
    };
  }, [loadChartData]);

  return (
    <>
      {children}
      {salesTarget && salesData.length > 0
        ? createPortal(<ProfessionalSalesChart data={salesData} />, salesTarget)
        : null}
      {paymentTarget
        ? createPortal(<ProfessionalPaymentDonut data={paymentData} />, paymentTarget)
        : null}
    </>
  );
}
