import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Navbar() {
  const { sdkHasLoaded, user, handleLogOut } = useDynamicContext();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLogin(true);
    }
  }, [user]);

  const navigate = useRouter();

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 shadow-sm text-white">
        <div className="w-full">
          <div className="flex backdrop-blur-2xl shadow-xl justify-between h-16 items-center border-opacity-20 rounded-lg px-2 border-[#FFF]">
            {/* Logo Section */}
            <div className="rounded-lg bg-custom-gradient p-[2px]">
              <div className="bg-clip-text text-transparent px-[2px] text-center bg-gradient-to-b from-[#ffffff90] to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold flex h-[46px] items-center justify-center rounded-lg">
                <img src="/logo2.png" className="h-12" alt="Logo" />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-4">
              {isLogin && (
                <button
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => navigate.push("/create")}
                >
                  Create Event
                </button>
              )}

              {/* Wallet Section */}
              <div className="relative">{/* <DynamicWidget /> */}</div>

              {/* Profile Section */}
              {isLogin && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar>
                      <AvatarImage
                        src={`https://noun-api.com/beta/pfp?name=${user?.verifiedCredentials[0].address}`}
                        alt="avatar"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black text-white border border-white/20">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-white/70 truncate">
                          {user?.verifiedCredentials[0].address}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-white/10"
                      onClick={() => navigate.push("/profile")}
                    >
                      My Events
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-white/10"
                      onClick={() => {
                        handleLogOut();
                        navigate.push("/");
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
