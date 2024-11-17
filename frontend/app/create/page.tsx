// app/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { useTelegramLogin, useDynamicContext } from "../../lib/dynamic";

import Navbar from "@/components/ui/Navbar";
import { useBiconomyAccount } from "../hooks/useBiconomyAccount.js";
import EventFactoryAbi from "../../abi/EventFactoryNFTsEmail.json";
import {
  EventInfo,
  TransactionResult,
  useEventTicketContract,
} from "@/lib/eventTicket";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Address, encodeFunctionData } from "viem";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { DateTimePicker } from "@/components/ui/datetime-picker";
import { EventTicketingTestAbi } from "../../../contracts/abis/EventTicketingTest2";
import { useRouter } from "next/navigation";

export default function Main() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useRouter();
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
  const { smartAccount, error: biconomyError }: any = useBiconomyAccount();
  const { buyTicket } = useEventTicketContract(smartAccount);
  async function CreateEvent() {
    const data = encodeFunctionData({
      abi: EventFactoryAbi.abi,
      functionName: "createEvent",
      args: [
        formData.eventName,
        formData.description,
        12999999999999,
        formData.location,
        imageSrc,
        10,
        0,
        "https://7bbe-210-1-49-172.ngrok-free.app/metadata/1",
        "0x0000000000000000000000000000000000000000",
      ],
    });
    const hash = await smartAccount.sendTransaction({
      calls: [
        {
          to: "0x439AEfC24D2BD67470891B5AAc2663ba0d148cf1",
          data,
        },
      ],
    });
    console.log("Transaction hash:", hash);

    const receipt = await smartAccount.waitForTransactionReceipt({
      hash,
    });

    console.log("Transaction receipt:", receipt);
  }
  useEffect(() => {
    if (smartAccount) {
      console.log("My Biconomy smart account", smartAccount);
    }
  }, [smartAccount]);

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

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    dateTime: "",
    location: "",
    minToken: "",
    selectedToken: "",
    locationHidden: false,
  });

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDateTimeChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      dateTime: value,
    }));
  };

  const handleTokenSelect = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      selectedToken: value,
    }));
  };
  const handleTokenLocationVisible = () => {
    setFormData((prev) => ({
      ...prev,
      locationHidden: !prev.locationHidden,
    }));
  };

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
              <Input
                id="eventName"
                placeholder="Event Name"
                type="text"
                value={formData.eventName}
                onChange={handleInputChange}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Input
                id="description"
                placeholder="Description"
                type="text"
                value={formData.description}
                onChange={handleInputChange}
              />
            </LabelInputContainer>

            <DateTimePicker
              date={formData?.dateTime}
              setDate={handleDateTimeChange}
            />

            <LabelInputContainer>
              <Input
                id="location"
                placeholder="Location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
              />
            </LabelInputContainer>

            <LabelInputContainer className="flex flex-row justify-between items-center">
              <Input
                id="minToken"
                placeholder="Min Token"
                type="text"
                value={formData.minToken}
                onChange={handleInputChange}
              />
              <Select onValueChange={handleTokenSelect}>
                <SelectTrigger className="w-[180px] backdrop-blur-lg shadow-2xl bg-neutral-900 border-none text-[#ffffff90]">
                  <SelectValue
                    className="bg-neutral-950 text-[#ffffff90]"
                    placeholder="Select Token"
                  />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 text-[#ffffff90] border-none">
                  <SelectGroup className="bg-neutral-950 text-[#ffffff90]">
                    <SelectItem
                      className="bg-neutral-950 text-[#ffffff90]"
                      value="$SUP"
                    >
                      $SUP
                    </SelectItem>
                    <SelectItem
                      className="bg-neutral-950 text-[#ffffff90]"
                      value="$MKI"
                    >
                      $MKI
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </LabelInputContainer>
            <div
              className="items-top flex flex-row items-center space-x-2"
              onClick={() => {
                handleTokenLocationVisible();
              }}
            >
              <input
                type="checkbox"
                checked={formData.locationHidden}
                onChange={handleTokenLocationVisible}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms1"
                  className="text-sm text-[#ffffff90] py-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Location visible
                </label>
              </div>
            </div>

            <Button
              onClick={() => {
                console.log("Form Data:", formData);
                CreateEvent();
              }}
            >
              Create
            </Button>
            <Button
              onClick={() => {
                navigate.push("/view");
              }}
            >
              View
            </Button>
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
