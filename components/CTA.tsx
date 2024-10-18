import Image from "next/image";
import config from "@/config";

const CTA = () => {
  return (
    <section className="relative hero overflow-hidden min-h-screen">
      <Image
        src="/ai-3.webp"
        alt="Background"
        className="object-cover w-full"
        fill
      />
      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            Unleash Your Creativity with AI
          </h2>
          <p className="text-lg opacity-80">
            Create stunning AI-driven film trailers. Let your imagination soar, capture powerful emotions, and tell a unique story that moves your audience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
