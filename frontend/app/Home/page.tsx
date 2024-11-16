// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useTelegramLogin, useDynamicContext } from "../../lib/dynamic";

import Navbar from "@/components/ui/Navbar";
import { useBiconomyAccount } from "../hooks/useBiconomyAccount.js";
import { Timeline } from "@/components/ui/timeline";

import { BackgroundGradient } from "../../components/ui/background-gradient";

export default function Main() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { smartAccount } = useBiconomyAccount();

  useEffect(() => {
    if (!sdkHasLoaded) return;
    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };
    console.log("user", user);
    signIn();
  }, [sdkHasLoaded, telegramSignIn, user]);

  useEffect(() => {
    if (smartAccount) {
      console.log("My Biconomy smart account", smartAccount);
    }
  }, [smartAccount]);
  const eventDataByDate = [
    {
      date: "Nov 16",
      events: [
        {
          time: "10:00 AM",
          title: "Pool House | Hacker House at Devcon (Nov 10-18)",
          description: "This is event 1",
          organiser: "EduDAO",
          location: "shown Upon Approval",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=80,height=80/event-covers/1w/878f8cee-bdb7-4084-a399-7bc36e68c437",
          status: "Going",
        },
        {
          time: "01:00 AM",
          title: "Pool House | Hacker House at Devcon (Nov 10-18)",
          description: "This is event 1",
          organiser: "EduDAO",
          location: "shown Upon Approval",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=80,height=80/event-covers/1w/878f8cee-bdb7-4084-a399-7bc36e68c437",
          status: "Going",
        },
      ],
    },
    {
      date: "Nov 16",
      events: [
        {
          time: "10:00 AM",
          title: "Pool House | Hacker House at Devcon (Nov 10-18)",
          description: "This is event 1",
          organiser: "EduDAO",
          location: "shown Upon Approval",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=80,height=80/event-covers/1w/878f8cee-bdb7-4084-a399-7bc36e68c437",
          status: "Going",
        },
        {
          time: "01:00 AM",
          title: "Pool House | Hacker House at Devcon (Nov 10-18)",
          description: "This is event 1",
          organiser: "EduDAO",
          location: "shown Upon Approval",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=80,height=80/event-covers/1w/878f8cee-bdb7-4084-a399-7bc36e68c437",
          status: "Going",
        },
      ],
    },
  ];
  const data = [
    {
      title: "Nov 10 Sunday",
      content: (
        <div className="flex gap-3 flex-col">
          <BackgroundGradient
            animate={false}
            className="rounded-[8px]  max-w-sm p-4 sm:p-10  bg-zinc-900"
          >
            <div className="flex flex-row">
              <div className="flex w-2/3 flex-col gap-1 text-start">
                <p className="text-[14px]     text-[hsla(0,0%,100%,.5)]">
                  Live 10:00 AM
                </p>
                <p className="text-[16px]      text-neutral-200">
                  Paradigm shift
                </p>
                <p className="text-[14px]    text-[hsla(0,0%,100%,.5)]">
                  By Exponential.ai
                </p>
                <p className="text-[14px] flex flex-row gap-1 items-center   text-[hsla(0,0%,100%,.5)]">
                  <div className="w-4 h-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                      <g
                        fill="none"
                        fill-rule="evenodd"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                      >
                        <path d="M2 6.854C2 11.02 7.04 15 8 15s6-3.98 6-8.146C14 3.621 11.314 1 8 1S2 3.62 2 6.854"></path>
                        <path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path>
                      </g>
                    </svg>
                  </div>{" "}
                  Vantage point
                </p>
                <p className="text-[14px] w-fit   text-white bg-[#3cbd2c]  px-[4px] rounded-[4px]">
                  Going
                </p>
              </div>
              <div className="flex flex-col">
                {" "}
                <img
                  className={"h-[100px] w-[100px]"}
                  src={
                    "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=80,height=80/event-covers/fb/9688f138-9174-41ea-943f-abf286938c36"
                  }
                />
              </div>
            </div>
          </BackgroundGradient>
        </div>
      ),
    },
  ];
  return (
    <div className="min-h-screen  bg-neutral-950   ">
      <Navbar />
      <div className="flex  text-center">
        {/* <AuroraBackground> */}
        {/* <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col gap-4 items-center justify-center px-4"
          > */}
        <div className="w-full">
          <Timeline data={eventDataByDate} />
        </div>
        {/* </motion.div> */}
        {/* </AuroraBackground> */}
      </div>
    </div>
  );
}
