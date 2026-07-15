import CustomLink from "@/components/CustomLink";
import Image from "next/image";

import chooseFun from "../public/choose-fun.webp";
import dearMusic from "../public/dear-music.jpg";
import iLoveBrent from "../public/i-love-brent-faiyaz.jpg";
import progressImportant from "../public/progress-important.jpg";
import stayGoated from "../public/stay-goated.jpg";
import programming from "../public/programming.webp";

export default function Home() {
    return (
        <div className="pb-10">
            <p className="motion-section">Hello! My name is Rassul.</p>
            <br />
            <div
                className="motion-section flex flex-wrap items-center gap-x-2 gap-y-1"
                style={{ animationDelay: "45ms" }}
            >
                Tools that I am interested in right now:{" "}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                        <CustomLink href="https://effect.website">
                            Effect
                        </CustomLink>
                    </span>
                    <span>
                        <CustomLink href="https://pi.dev">pi</CustomLink>
                    </span>
                    <span>
                        <CustomLink href="https://opencode.ai">
                            OpenCode
                        </CustomLink>
                    </span>
                    <span>
                        <CustomLink href="https://go.dev">
                            Golang
                        </CustomLink>
                    </span>
                </div>
            </div>
            <br />
            <p className="motion-section" style={{ animationDelay: "90ms" }}>
                Outside of coding I enjoy my time with my girlfriend, playing
                football, and record videos on my{" "}
                <CustomLink href="https://www.youtube.com/@rxssula">
                    YouTube channel
                </CustomLink>
                .
            </p>
            <br />
            <p className="motion-section" style={{ animationDelay: "135ms" }}>
                Check out my <CustomLink href={"/blog"}>blog</CustomLink>.
            </p>
            <br />
            <div
                className="motion-section flex flex-wrap items-center gap-x-2 gap-y-1"
                style={{ animationDelay: "180ms" }}
            >
                Socials:{" "}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                        <CustomLink href="https://github.com/rxssula">
                            github
                        </CustomLink>
                    </span>
                    <span>
                        <CustomLink href="https://x.com/rxssula">X</CustomLink>
                    </span>
                    <span>
                        <CustomLink href="https://linkedin.com/in/rxssula/">
                            linkedin
                        </CustomLink>
                    </span>
                    <span>
                        <CustomLink href="https://t.me/cnriom">
                            telegram
                        </CustomLink>
                        .
                    </span>
                </div>
            </div>
            <br />
            <h1 className="motion-section" style={{ animationDelay: "225ms" }}>
                These images can describe what person I am.
            </h1>
            <div className="mt-6 sm:mt-8 columns-1 sm:columns-2 gap-4 space-y-4">
                <Image
                    src={chooseFun}
                    alt="Choose fun"
                    className="w-full rounded-lg h-auto"
                />
                <Image
                    src={dearMusic}
                    alt="Dear music"
                    className="w-full rounded-lg h-auto"
                />
                <Image
                    src={iLoveBrent}
                    alt="I love Brent Faiyaz"
                    className="w-full rounded-lg h-auto"
                />
                <Image
                    src={progressImportant}
                    alt="Progress important"
                    className="w-full rounded-lg h-auto"
                />
                <Image
                    src={stayGoated}
                    alt="Stay goated"
                    className="w-full rounded-lg h-auto"
                />
                <Image
                    src={programming}
                    alt="Programming"
                    className="w-full rounded-lg h-auto"
                />
            </div>
        </div>
    );
}
