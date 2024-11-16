// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useTelegramLogin, useDynamicContext } from "../../lib/dynamic";

import Navbar from "@/components/ui/Navbar";
import { useBiconomyAccount } from "../hooks/useBiconomyAccount.js";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { DateTimePicker } from "@/components/ui/datetime-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [date, setDate] = useState<Date>();

  const [imageSrc, setImageSrc] = useState<any>(null);

  // Function to generate random text
  const generateRandomText = () => {
    return Math.random().toString(36).substring(2, 12); // Generates a random alphanumeric string
  };

  useEffect(() => {
    const fetchPFP = async () => {
      const randomText = generateRandomText();

      setImageSrc(`https://noun-api.com/beta/pfp?name=${randomText}`);
    };

    fetchPFP();
  }, []);

  return (
    <div className="min-h-screen  bg-neutral-950 pt-20   ">
      <Navbar />
      <div className="flex flex-col px-2 text-center w-full">
        <h2 className="text-4xl mb-4 flex font-sans font-bold   text-[#ffffff90] max-w-4xl">
          Create Ev3nt
        </h2>
        {imageSrc ? (
          <img src={imageSrc} alt="Generated PFP" />
        ) : (
          <p>Loading...</p>
        )}
        <div className="my-8 w-full ">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Input id="firstname" placeholder="Event Name" type="text" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Input id="lastname" placeholder="Description" type="text" />
            </LabelInputContainer>
            <DateTimePicker />
            <LabelInputContainer>
              <Input id="location" placeholder="Location" type="text" />
            </LabelInputContainer>
            <Button>Create </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col backdrop-blur-lg shadow-2xl bg-neutral-900 rounded-[8px] space-y-2 w-full",
        className
      )}
    >
      {children}
    </div>
  );
};
