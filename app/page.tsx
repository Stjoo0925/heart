import StickerPeel from "./components/StickerPeel";
import GridMotion from "./components/GridMotionProps";
import { Noto_Serif_KR } from "next/font/google";

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function Home() {
  const items = [
    "/img/19.jpeg",
    "/img/1.jpeg",
    "/img/2.jpeg",
    "/img/3.jpeg",
    "/img/4.jpeg",
    "/img/5.jpeg",
    "/img/6.jpeg",
    "/img/7.jpeg",
    "/img/9.jpeg",
    "/img/10.jpeg",
    "/img/22.JPG",
    "/img/11.jpeg",
    "/img/12.jpeg",
    "/img/13.jpeg",
    "/img/14.jpeg",
    "/img/15.jpeg",
    "/img/8.jpeg",
    "/img/16.jpeg",
    "/img/17.jpeg",
    "/img/18.jpeg",
    "/img/20.jpeg",
    "/img/21.jpeg",
    "/img/23.jpeg",
    "/img/24.jpeg",
    "/img/25.jpeg",
    "/img/26.jpeg",
    "/img/27.jpeg",
  ];

  return (
    <>
      <div className="h-[100svh] w-full overflow-hidden">
        <div className="relative min-h-screen">
          <div className="absolute inset-0 -z-10">
            <GridMotion items={items} />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-2xl px-10 py-6 text-center">
              <h1
                className={`${notoSerifKr.className} text-5xl font-extrabold tracking-tight text-gray-900`}
              >
                Heart For You ❤️
              </h1>
            </div>
          </div>

          <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
              <StickerPeel
                imageSrc="/sticker.png"
                width={550}
                rotate={30}
                peelBackHoverPct={20}
                peelBackActivePct={40}
                shadowIntensity={0.6}
                lightingIntensity={0.1}
                initialPosition={{ x: -300, y: -300 }}
                className="z-20"
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
