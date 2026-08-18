import { buildWaLink } from "@/lib/whatsapp";

const sizes = {
  sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-full gap-2",
};

export function WhatsAppButton({
  phone,
  message,
  label,
  size = "md",
}: {
  phone: string;
  message: string;
  label?: string;
  size?: keyof typeof sizes;
}) {
  return (
    <a
      href={buildWaLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center bg-[#25D366] font-medium text-white shadow-sm shadow-[#25D366]/25 transition-all duration-150 hover:bg-[#1ebe57] active:scale-[0.98] ${sizes[size]}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.876.52 3.63 1.42 5.13L2 22l4.998-1.312A9.955 9.955 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.2a8.16 8.16 0 0 1-4.166-1.14l-.299-.177-2.965.778.792-2.891-.194-.297A8.17 8.17 0 0 1 3.8 12c0-4.53 3.68-8.2 8.2-8.2 4.52 0 8.2 3.67 8.2 8.2 0 4.53-3.68 8.2-8.2 8.2z" />
      </svg>
      {label ?? "Message on WhatsApp"}
    </a>
  );
}
