import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    if (user) {
      setIsLogin(true);
    }
  }, [user]);

  return (
    <>
      {/* user loggedin Nav */}
      {isLogin && (
        <nav className={"fixed inset-x-0 top-0 z-50  shadow-sm  text-white "}>
          <div className="w-full    ">
            <div className="flex backdrop-blur-2xl shadow-xl   justify-between h-16 items-center border-opacity-20 rounded-[8px] px-2 	 border-[#FFF]">
              <div className=" rounded-[8px] bg-custom-gradient p-[2px]">
                <div className="bg-clip-text text-transparent px-[2px] text-center bg-gradient-to-b from-[#ffffff90] to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold   flex   h-[46px]   items-center justify-center  rounded-[8px]">
                  t
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
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
                  tick3t
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
