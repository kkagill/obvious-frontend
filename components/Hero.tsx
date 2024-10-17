import Image from "next/image";
import config from "@/config";

const Hero = () => {
  return (
    <section className="relative max-w-full mx-auto px-4 py-8 md:px-8 md:py-16 lg:py-20 lg:h-screen lg:mt-10 lg:mb-10 lg:mr-20 lg:ml-20 animate-shimmer">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden animate-fadeIn">
        <Image
          src="/ai-1.webp"
          alt="Creative AI Contests Background"
          objectFit="cover"
          layout="fill"
          className="rounded-lg"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center justify-start pt-32 h-full font-poppins">
        {/* Main Title */}
        <h1 className="font-extrabold text-5xl sm:text-5xl md:text-6xl lg:text-8xl tracking-widest uppercase leading-snug text-yellow-300 drop-shadow-md animate-slideInUp">
          <span className="text-shadow-xl text-yellow-400">Unleash Creativity</span><br />
          AI Trailer Contests
        </h1>

        {/* Subtitle */}
        <p className="mt-16 text-base sm:text-lg md:text-2xl lg:text-3xl font-medium italic text-white tracking-wide animate-fadeIn delay-500">
          Discover a world of <span className="font-semibold text-yellow-300">Epic AI Film Contests</span>
        </p>
        <p className="mt-2 text-base sm:text-lg md:text-2xl lg:text-3xl font-medium italic text-white tracking-wide animate-fadeIn delay-700">
          and compete with creators across the globe
        </p>
      </div>
    </section>
  );
};

export default Hero;
