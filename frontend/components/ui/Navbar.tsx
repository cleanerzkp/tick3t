import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      {/* user loggedin Nav */}
      {isLogin && (
        <nav className={"fixed inset-x-0 top-0 z-50  shadow-sm  text-white "}>
          <div className="w-full    ">
            <div className="flex backdrop-blur-2xl shadow-xl   justify-between h-16 items-center border-opacity-20 rounded-[8px] px-2 	 border-[#FFF]">
              <div className=" rounded-[8px] bg-custom-gradient p-[2px]">
                <div className="bg-clip-text text-transparent px-[2px] text-center bg-gradient-to-b from-[#ffffff90] to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold   flex   h-[46px]   items-center justify-center  rounded-[8px]">
                  <img src="/logo2.png" className="h-12 " />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className=""
                  onClick={() => {
                    navigate.push("/create");
                  }}
                >
                  Create Event
                </div>
                <Avatar>
                  {user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <AvatarImage
                          src={`https://noun-api.com/beta/pfp?name=${user?.verifiedCredentials[0].address}`}
                          alt="avatar"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black text-white">
                        <DropdownMenuLabel
                          onClick={() => {
                            handleLogOut();
                            navigate.push("/");
                          }}
                        >
                          Logout
                        </DropdownMenuLabel>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </nav>
      )}
      {!isLogin && (
        <nav className={"fixed inset-x-0 top-0 z-50  shadow-sm  text-white "}>
          <div className="w-full    ">
            <div className="flex backdrop-blur-2xl shadow-xl   justify-between h-16 items-center border-opacity-20 rounded-[8px] px-2 	 border-[#FFF]">
              <div className=" rounded-[8px] bg-custom-gradient p-[2px]">
                <div className="bg-clip-text text-transparent px-[2px] text-center bg-gradient-to-b from-[#ffffff90] to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold   flex   h-[46px]   items-center justify-center  rounded-[8px]">
                  <img src="/logo2.png" className="h-12 " />
                </div>
              </div>

              <div className="flex items-center gap-4"></div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
