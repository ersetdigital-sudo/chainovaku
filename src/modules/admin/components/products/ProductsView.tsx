"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Package,
  Pencil,
  Plus,
} from "../../icons";
import { PageHero } from "../ui/PageHero";
import { EmptyState } from "../ui/EmptyState";
import { Toggle } from "../ui/Toggle";
import { ServiceModal } from "./ServiceModal";
import { ProductModal } from "./ProductModal";
import { BillSettings } from "./BillSettings";
import { useToast } from "../providers/ToastProvider";
import { toggleProductAction } from "../../data/actions/products";
import { formatRupiah } from "../../lib/format";
import { cn, initials, productProfit } from "../../lib/utils";
import type {
  AdminBrand,
  ProductRow,
  ServiceRow,
} from "../../types";

export function ProductsView({
  brand,
  services,
  products,
}: {
  brand: AdminBrand;
  services: ServiceRow[];
  products: ProductRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(
    services[0]?.id ?? null,
  );
  const [serviceModal, setServiceModal] = useState<
    { mode: "new" } | { mode: "edit"; service: ServiceRow } | null
  >(null);
  const [productModal, setProductModal] = useState<
    { service: ServiceRow; product: ProductRow | null } | null
  >(null);
  const [pendingProduct, setPendingProduct] = useState<string | null>(null);

  const selected =
    services.find((service) => service.id === selectedId) ?? services[0] ?? null;
  const serviceProducts = selected
    ? products.filter((product) => product.service_id === selected.id)
    : [];

  async function handleToggle(product: ProductRow) {
    setPendingProduct(product.id);
    const result = await toggleProductAction(product.id, !product.aktif);
    setPendingProduct(null);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  return (
    <div className="adm-page">
      <PageHero
        icon={Package}
        title="Produk & Harga"
        subtitle="Atur layanan, nominal, modal dan harga jual"
        actions={
          <button
            type="button"
            className="adm-btn"
            onClick={() => setServiceModal({ mode: "new" })}
          >
            <Plus size={18} />
            Tambah layanan
          </button>
        }
      />

      <div className="adm-flex adm-produk-layout">
        <aside className="adm-card adm-svc-card">
          <span className="adm-label adm-svc-label">Layanan</span>
          {services.length === 0 ? (
            <EmptyState
              compact
              icon={Package}
              title="Belum ada layanan"
              description="Tambahkan layanan pertama untuk brand ini."
              action={
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  onClick={() => setServiceModal({ mode: "new" })}
                >
                  <Plus size={16} />
                  Tambah layanan
                </button>
              }
            />
          ) : (
            <div className="adm-svc-list">
              {services.map((service) => {
                const count = products.filter(
                  (product) => product.service_id === service.id,
                ).length;
                const isActive = selected?.id === service.id;
                const badge = !service.aktif
                  ? { label: "Nonaktif", className: "adm-mini-badge is-off" }
                  : service.jenis === "tagihan"
                    ? { label: "Cek manual", className: "adm-mini-badge is-warn" }
                    : { label: "Aktif", className: "adm-mini-badge" };
                return (
                  <button
                    key={service.id}
                    type="button"
                    className={cn("adm-svc-item", isActive && "is-active")}
                    onClick={() => setSelectedId(service.id)}
                  >
                    <span className="adm-ini">{initials(service.nama)}</span>
                    <span className="adm-svc-meta">
                      <b>{service.nama}</b>
                      <small>
                        {service.jenis === "tagihan"
                          ? "Tagihan"
                          : `${count} nominal`}
                      </small>
                    </span>
                    <span className={badge.className}>{badge.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="adm-card adm-svc-detail">
          {!selected ? (
            <EmptyState
              icon={Package}
              title="Pilih layanan"
              description="Tambahkan layanan untuk mulai mengatur produk dan harga."
            />
          ) : (
            <>
              <div className="adm-svc-head">
                <div>
                  <h2>{selected.nama}</h2>
                  <p className="adm-hint">
                    Input pembeli:{" "}
                    {selected.input_fields.length
                      ? selected.input_fields.map((field) => field.label).join(" + ")
                      : "-"}
                  </p>
                </div>
                <div className="adm-svc-actions">
                  <button
                    type="button"
                    className="adm-btn adm-btn-out adm-btn-sm"
                    onClick={() =>
                      setServiceModal({ mode: "edit", service: selected })
                    }
                  >
                    <Pencil size={16} />
                    Edit layanan
                  </button>
                  {selected.jenis === "nominal" ? (
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm"
                      onClick={() =>
                        setProductModal({ service: selected, product: null })
                      }
                    >
                      <Plus size={16} />
                      Nominal
                    </button>
                  ) : null}
                </div>
              </div>

              {selected.jenis === "tagihan" ? (
                <BillSettings
                  key={`bill-${selected.id}`}
                  brand={brand}
                  service={selected}
                />
              ) : (
                <>
                  {serviceProducts.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="Belum ada nominal"
                      description="Tambahkan nominal dan harga jual untuk layanan ini."
                      action={
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm"
                          onClick={() =>
                            setProductModal({ service: selected, product: null })
                          }
                        >
                          <Plus size={16} />
                          Tambah nominal
                        </button>
                      }
                    />
                  ) : (
                    <div className="adm-product-table">
                      <div className="adm-ptab adm-ptab-head">
                        <span>Nominal</span>
                        <span>Modal</span>
                        <span>Harga jual</span>
                        <span>Untung</span>
                        <span>Aktif</span>
                      </div>
                      {serviceProducts.map((product) => (
                        <div className="adm-ptab" key={product.id}>
                          <button
                            type="button"
                            className="adm-product-name"
                            onClick={() =>
                              setProductModal({ service: selected, product })
                            }
                          >
                            <span>{product.nama}</span>
                            <Pencil size={13} />
                          </button>
                          <span className="adm-box adm-box-ro">
                            {formatRupiah(product.harga_modal)}
                          </span>
                          <span className="adm-box">
                            {formatRupiah(product.harga_jual)}
                          </span>
                          <b
                            className={
                              productProfit(
                                product.harga_jual,
                                product.harga_modal,
                              ) < 0
                                ? "adm-profit-number is-loss"
                                : "adm-profit-number"
                            }
                          >
                            {formatRupiah(
                              productProfit(
                                product.harga_jual,
                                product.harga_modal,
                              ),
                            )}
                          </b>
                          <span className="adm-toggle-cell">
                            <Toggle
                              checked={product.aktif}
                              onChange={() => handleToggle(product)}
                              disabled={pendingProduct === product.id}
                              label={`${product.aktif ? "Nonaktifkan" : "Aktifkan"} ${product.nama}`}
                            />
                            {pendingProduct === product.id ? (
                              <Loader2 size={14} className="adm-spin" />
                            ) : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="adm-hint adm-table-note">
                    Produk yang dimatikan langsung hilang dari web, data transaksi
                    lamanya tetap aman.
                  </p>
                </>
              )}
            </>
          )}
        </section>
      </div>

      {serviceModal ? (
        <ServiceModal
          key={serviceModal.mode === "edit" ? serviceModal.service.id : "new"}
          service={serviceModal.mode === "edit" ? serviceModal.service : null}
          onClose={() => setServiceModal(null)}
          onCreated={(id) => setSelectedId(id)}
        />
      ) : null}

      {productModal ? (
        <ProductModal
          key={productModal.product?.id ?? `new-${productModal.service.id}`}
          service={productModal.service}
          product={productModal.product}
          onClose={() => setProductModal(null)}
        />
      ) : null}
    </div>
  );
}
