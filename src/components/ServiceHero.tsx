import { Icon } from "./Icons";
import type { Service } from "@/lib/services";

export function ServiceHero({ service }: { service: Service }) {
  return (
    <section className="rounded-xl bg-[#FFEF4D] border border-[#E8D83F] p-5 md:p-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="kicker text-[#2A428C]">Layanan / {service.slug}</div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">{service.title}</h1>
        <p className="text-sm md:text-base text-[#3B456B] mt-2 max-w-2xl leading-relaxed">
          {service.description}
        </p>
      </div>
      <span className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-lg bg-[#2A428C] grid place-items-center">
        <Icon name={service.icon.name} size={23} stroke="#FFEF4D" />
      </span>
    </section>
  );
}
