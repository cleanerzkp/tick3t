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
          title: "Ethglobal singapore",
          description: "This is event 1",
          organiser: "Ethglobal",
          location: "QNSCC Bangkok",
          img: "https://ethglobal.storage/events/bangkok/logo/default",
          status: "Going",
        },
        {
          time: "01:00 AM",
          title: "Pool House | Hacker House at Devcon (Nov 10-18)",
          description: "This is event 1",
          organiser: "EduDAO",
          location: "hyatt regency bangkok sukhumvit",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=80,height=80/event-covers/1w/878f8cee-bdb7-4084-a399-7bc36e68c437",
          status: "Going",
        },
        {
          time: "10:00 AM",
          title: "Web3 Devrel Night @Devcon",
          description: "This is event   1",
          organiser: "aave",
          location: "The Avani bangkok",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=400,height=400/event-covers/4v/6b147b0e-d610-451c-bcb0-143fd2b66178",
          status: "Going",
        },
        {
          time: "10:00 AM",
          title: "Omi apps hackathon",
          description: "This is event 1",
          organiser: "omi chain",
          location: "Grand Mercure bangkok",
          img: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=400,height=400/event-covers/gc/a6593a56-980b-4a66-a0ab-e2053f7a5408",
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
          location: "Qnscc bangkok",
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

  return (
    <div className="min-h-screen  bg-neutral-950   ">
      <Navbar />
      <div className="flex  text-center">
        <div className="w-full">
          <Timeline data={eventDataByDate} />
        </div>
      </div>
    </div>
  );
}
