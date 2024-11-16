"use client";

import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";
import Spinner from "./Spinner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/ui/Navbar";
import { useBiconomyAccount } from "./hooks/useBiconomyAccount.js";
import dynamic from 'next/dynamic';
import EventTicketing from "./components/EventTicketing";

export default function Main() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { smartAccount } = useBiconomyAccount();

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const signIn = async () => {
      try {
        if (!user) {
          await telegramSignIn({ forceCreateUser: true });
        }
      } catch (error) {
        console.error("Telegram sign in error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    signIn();
  }, [sdkHasLoaded, telegramSignIn, user]);

  useEffect(() => {
    if (smartAccount) {
      console.log('My Biconomy smart account', smartAccount);
    }
  }, [smartAccount]);

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
                "w-[380px] bg-transparent backdrop-blur-xl shadow-xl text-[#ffffff] border-[#ffffff90] border-[1px]"
              )}
            >
              <CardHeader>
                <CardTitle>
                  <div className="text-3xl font-sans md:text-7xl font-bold text-white text-center">
                    Welcome to Tick3t
                  </div>
                </CardTitle>
                <CardDescription>One Fucking solution.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="mt-6 flex w-full items-center justify-center">
                  {isLoading ? <Spinner /> : <DynamicWidget />}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AuroraBackground>

        {smartAccount && (
          <div className="mt-8 w-full max-w-4xl">
            <EventTicketing smartAccount={smartAccount} />
          </div>
        )}
      </div>
    </div>
  );
}