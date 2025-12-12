import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { ProfileMenu } from "./ProfileMenu"; // adjust path
import { requireAdminAuth } from "@/lib/auth-utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const NavBar = async () => {

  const session = await requireAdminAuth()
  const userInfo = session.user
  const user = {
    name: userInfo.name,
    email: userInfo.email,
    image: userInfo.image ?? "",
    role: userInfo.role
  };

  return (
    <nav className="md:h-20 h-18 flex border-b justify-between items-center font-medium bg-white">
      <div className="pl-6 flex items-center">
        <span className={cn("text-2xl md:text-4xl font-semibold", poppins.className)}>
          VivaCrochet
        </span>
      </div>

      <div className="pr-6 flex items-center gap-4">
        <ProfileMenu user={user} />
      </div>
    </nav>
  );
};

export default NavBar;
