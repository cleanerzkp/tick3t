// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  DynamicWidget,
  useTelegramLogin,
  useDynamicContext,
} from "../lib/dynamic";
import Image from "next/image";
import Button from "./components/Button";
import Link from "next/link";
import Spinner from "./Spinner";
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
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };
    signIn();
  }, [sdkHasLoaded, telegramSignIn, user]);

  useEffect(() => {
    if (smartAccount) {
      console.log('My Biconomy smart account', smartAccount);
    }
  }, [smartAccount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center">
            <div className="flex space-x-4"></div>
          </div>
        </div>
        <div className="mt-6">
          {isLoading ? <Spinner /> : <DynamicWidget />}
        </div>

        {smartAccount && (
          <div className="mt-8 w-full max-w-4xl">
            <EventTicketing smartAccount={smartAccount} />
          </div>
        )}
      </div>
    </div>
  );
}