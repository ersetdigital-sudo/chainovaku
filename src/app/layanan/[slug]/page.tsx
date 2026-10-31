import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ServiceAppBar } from "@/components/ServiceAppBar";
import { ServiceHero } from "@/components/ServiceHero";
import { ServiceForm } from "@/components/ServiceForm";
import { services, serviceBySlug } from "@/lib/services";
import { getHydratedService } from "@/lib/catalog-hydrate";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} · Chainovaku`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { services: hydratedServices, games, service } = await getHydratedService(slug);
  if (!service) notFound();

  const others = hydratedServices.filter((s) => s.slug !== service.slug);

  return (
    <>
      <ServiceAppBar service={service} />
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="px-4 pt-4 pb-6 md:px-5 lg:max-w-6xl lg:mx-auto lg:py-8">
        <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#5C6480] mb-4">
          <Link href="/" className="hover:text-[#1D2650]">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/#layanan" className="hover:text-[#1D2650]">
            Layanan
          </Link>
          <span>/</span>
          <span className="text-[#1D2650]">{service.title}</span>
        </nav>

        <ServiceHero service={service} />

        <div className="mt-4 lg:mt-6">
          <ServiceForm service={service} others={others} games={games} />
        </div>
      </main>
    </>
  );
}
