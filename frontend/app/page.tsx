"use client";
import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";
import Spinner from "./Spinner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/ui/Navbar";
import { useBiconomyAccount } from "./hooks/useBiconomyAccount.js";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import dynamic from "next/dynamic";
import EventTicketing from "./components/EventTicketing";
import { useEventTicketContract } from "@/lib/eventTicket";
import { useRouter } from "next/navigation";
import { MiniKit } from "@worldcoin/minikit-js";

export default function Main() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState(true);
  const { smartAccount, error: biconomyError } = useBiconomyAccount();
  const { buyTicket } = useEventTicketContract(smartAccount);
  const navigate = useRouter();

  useEffect(() => {
    console.log("SDK Loaded:", sdkHasLoaded);
    console.log("User State:", user);

    if (!sdkHasLoaded) {
      console.log("SDK not yet loaded, skipping sign-in...");
      return;
    }

    const signIn = async () => {
      try {
        if (!user) {
          console.log("Attempting Telegram sign-in...");
          await telegramSignIn({ forceCreateUser: true });
          console.log("Telegram sign-in successful.");
        }
      } catch (error) {
        console.error("Telegram sign-in error:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
        console.log("Finished sign-in process. Loading state:", isLoading);
      }
    };

    signIn();
  }, [sdkHasLoaded, telegramSignIn, user]);

  useEffect(() => {
    if (smartAccount) {
      console.log("Smart account initialized:", smartAccount);
    } else {
      console.warn("Smart account not initialized yet.");
    }
  }, [smartAccount]);
  useEffect(() => {
    if (user?.verifiedCredentials[0].address) {
      //navigate to home if already logged in
      navigate.push("/Home");
    }
    console.log("MiniKit", MiniKit.isInstalled());
  }, [user]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center">
        <AuroraBackground>
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col gap-4 items-center justify-center px-4"
          >
            <Card
              className={cn(
                "w-[380px] bg-transparent   text-[#ffffff] border-[#ffffff90] border-none"
              )}
            >
              <CardHeader>
                <CardTitle>
                  <div className="text-3xl font-sans md:text-7xl font-bold text-[#ffffff99] text-center">
                    Welcome to Tick3t
                  </div>
                </CardTitle>
                <CardDescription>One Solution.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="mt-6 flex w-full items-center justify-center">
                  {isLoading ? (
                    <>
                      <Spinner />
                      <p>Loading wallet...</p>
                    </>
                  ) : (
                    <>
                      {" "}
                      <DynamicWidget />{" "}
                    </>
                  )}
                </div>
                {/* {biconomyError && (
                  <div className="mt-4 text-red-500">
                    <p>Error initializing smart account: {biconomyError}</p>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </motion.div>
        </AuroraBackground>

        {smartAccount ? (
          <div className="mt-8 w-full max-w-4xl">
            <EventTicketing smartAccount={smartAccount} />
            <p>Smart Account Component Rendered.</p>
          </div>
        ) : (
          !biconomyError && <p>Waiting for Smart Account Initialization...</p>
        )}
        {/* {biconomyError && (
          <div className="mt-4 text-red-500">
            <p>Error initializing smart account: {biconomyError}</p>
          </div>
        )} */}
      </div>
    </div>
  );
}
