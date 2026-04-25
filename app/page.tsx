import CustomLink from "@/components/CustomLink";
import Image from "next/image";

import chooseFun from "../public/choose-fun.webp";
import dearMusic from "../public/dear-music.jpg";
import iLoveBrent from "../public/i-love-brent-faiyaz.jpg";
import progressImportant from "../public/progress-important.jpg";
import stayGoated from "../public/stay-goated.jpg";

export default function Home() {
    return (
        <div className="max-w-3xl mx-auto py-10">
            <p>Hello! My name is Rassul.</p>
            <p>I love writing code just for fun.</p>
            <br />
            <p>
                Outside of coding I enjoy my time with my girlfriend, play
                football, and maybe record videos on my{" "}
                <CustomLink href="https://www.youtube.com/@rxssula">
                    YouTube channel
                </CustomLink>
                .
            </p>
            <br />
            <p>
                Check out my <CustomLink href={"/blog"}>blog</CustomLink>.
            </p>
            <br />
            <div className="flex items-center gap-2">
                Socials:{" "}
                <div className="flex flex-row gap-2 items-center">
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
            <h1>These images can describe what person I am.</h1>
            <div className="mt-8 columns-1 sm:columns-2 gap-4 space-y-4">
                <Image
                    src={chooseFun}
                    alt="Choose fun"
                    className="rounded-lg w-full h-auto"
                />
                <Image
                    src={dearMusic}
                    alt="Dear music"
                    className="rounded-lg w-full h-auto"
                />
                <Image
                    src={iLoveBrent}
                    alt="I love Brent Faiyaz"
                    className="rounded-lg w-full h-auto"
                />
                <Image
                    src={progressImportant}
                    alt="Progress important"
                    className="rounded-lg w-full h-auto"
                />
                <Image
                    src={stayGoated}
                    alt="Stay goated"
                    className="rounded-lg w-full h-auto"
                />
            </div>
        </div>
    );
}
