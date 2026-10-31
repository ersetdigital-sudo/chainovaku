import { GAMES, type Game } from "@/lib/games";
import { services as baseServices, type Item, type Service } from "@/lib/services";
import {
  getCatalog,
  type CatalogMethod,
  type CatalogService,
} from "@/lib/db/server";
import type { WebBrand } from "@/lib/db/types";

function hydrateServices(dbServices: CatalogService[]): Service[] {
  const bySlug = new Map(dbServices.map((service) => [service.slug, service]));

  return baseServices.map((service) => {
    const dbService = bySlug.get(service.slug);
    if (!dbService) return service;

    if (service.type === "game") {
      return { ...service, dbServiceId: dbService.dbId };
    }

    if (service.type === "bill") {
      const items: Item[] = dbService.products.map((product) => [
        product.nama,
        "",
        product.hargaJual,
        product.id,
      ]);
      return { ...service, dbServiceId: dbService.dbId, items, admin: 0 };
    }

    let index = 0;
    const items = (service.items ?? []).map((item) => {
      const dbProduct =
        dbService.products[index] ??
        dbService.products.find((product) => product.nama === item[0]);
      index += 1;
      return dbProduct
        ? ([item[0], item[1], dbProduct.hargaJual, dbProduct.id] as Item)
        : item;
    });

    return { ...service, dbServiceId: dbService.dbId, items };
  });
}

function hydrateGames(dbService: CatalogService | undefined): Record<string, Game> {
  if (!dbService) return GAMES;

  const next: Record<string, Game> = {};
  let index = 0;

  for (const [gameName, game] of Object.entries(GAMES)) {
    const items = game.items.map((item) => {
      const dbProduct =
        dbService.products.find((product) => product.nama === `${gameName} · ${item[0]}`) ??
        dbService.products[index];
      index += 1;
      return dbProduct
        ? ([item[0], item[1], dbProduct.hargaJual, dbProduct.id] as Item)
        : item;
    });
    const chips = game.chips.map((chip) => {
      const match = items.find((item) => item[2] === chip[2]);
      return match ? ([chip[0], chip[1], match[2], match[3]] as Item) : chip;
    });
    next[gameName] = { ...game, items, chips };
  }

  return next;
}

export type Storefront = {
  services: Service[];
  games: Record<string, Game>;
  methods: CatalogMethod[];
  brand: WebBrand | null;
};

export async function getStorefront(): Promise<Storefront> {
  const result = await getCatalog();
  const data = result.data;
  if (!data) {
    return { services: baseServices, games: GAMES, methods: [], brand: null };
  }

  return {
    services: hydrateServices(data.services),
    games: hydrateGames(data.services.find((service) => service.slug === "top-up-game")),
    methods: data.methods,
    brand: data.brand,
  };
}

export async function getHydratedService(slug: string) {
  const storefront = await getStorefront();
  return {
    services: storefront.services,
    games: storefront.games,
    service: storefront.services.find((service) => service.slug === slug) ?? null,
    methods: storefront.methods,
    brand: storefront.brand,
  };
}
