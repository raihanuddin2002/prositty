"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  HiOutlineCheck,
  HiOutlineClipboardCopy,
  HiOutlineCollection,
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlinePlus,
  HiOutlineUser,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { ItemsProps, UserData } from "./items";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect, Fragment } from "react";
import { Database } from "@/types_db";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export interface ProfileDropdownProps extends ItemsProps {
  wrapper?: string;
  setMenuState?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProfileDropDown({
  wrapper,
  userData,
  session,
  setMenuState,
}: ProfileDropdownProps) {
  const supabase = createClientComponentClient<Database>();

  const [avatarUrl, setAvatarUrl] = useState<
    UserData["avatar_url"] | undefined
  >(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) { }
    }

    if (userData?.avatar_url) downloadImage(userData?.avatar_url);
  }, [userData?.avatar_url, supabase]);

  const initials = getInitials(userData?.full_name);

  const inviteLink = `https://www.prositty.com/?ref=${encodeURIComponent(
    userData?.full_name || userData?.username || "A Prositty user"
  )}`;

  function copyInviteLink() {
    if (!copied) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    }
  }

  return (
    <div className={wrapper}>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 outline-none rounded-full ring-offset-2 ring-gray-200 ring-2 lg:hover:ring-primary transition-all duration-100">
              <Avatar>
                <AvatarImage
                  alt={userData?.full_name || "Your user avatar image"}
                  src={avatarUrl || undefined}
                  className="w-full h-full rounded-full object-fill"
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" sideOffset={7} align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuLabel className="text-gray-600 text-sm">
              {session?.user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/account" onClick={() => setMenuState!(false)}>
                  <HiOutlineUser className="mr-2 h-5 w-5 text-gray-600" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  href="/account/recommendations"
                  onClick={() => setMenuState!(false)}
                >
                  <HiOutlineLocationMarker className="mr-2 h-5 w-5 text-gray-600" />
                  <span>My Recommendations</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  href="/recommendations/add"
                  onClick={() => setMenuState!(false)}
                >
                  <HiOutlinePlus className="mr-2 h-5 w-5 text-gray-600" />
                  <span>Add a Recommendation</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="bg-primary/20">
                <DialogTrigger className="flex flex-row">
                  <HiOutlineUserGroup className="mr-2 h-5 w-5 text-gray-600" />
                  <span>Invite a friend</span>
                </DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {userData?.admin?.valid && (
              <Fragment>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href="/categories"
                      onClick={() => setMenuState!(false)}
                    >
                      <HiOutlineCollection className="mr-2 h-5 w-5 text-gray-600" />
                      <span>Manage Categories</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </Fragment>
            )}
            <DropdownMenuGroup>
              <form action="/api/auth/signout" method="post">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <button
                    type="submit"
                    className="w-full group text-gray-600"
                    onClick={() => setMenuState!(false)}
                  >
                    <HiOutlineLogout className="mr-2 h-5 w-5 group-hover:text-red-500 transition-colors duration-100" />
                    <span className="text-black">Logout</span>
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a friend</DialogTitle>
            <DialogDescription>
              You can invite a friend to Prositty by entering their email and
              sending them an email invitation or copying the link provided
              below.
            </DialogDescription>
            <div className="space-y-3">
              {/* <div className="flex flex-col space-y-2">
                <div className="grid flex-1 gap-2 w-full">
                  <Label htmlFor="email">Email a friend</Label>
                  <Input id="link" defaultValue="friend@example.com" />
                </div>
                <Button type="button" className="" variant="secondary">
                  Send
                  <HiOutlineMail className="ml-1 h-5 w-5" />
                </Button>
              </div> */}
              <div className="flex flex-col space-y-2">
                <div className="grid flex-1 gap-2 w-full">
                  <Label htmlFor="link">Invite link</Label>
                  <Input id="link" defaultValue={inviteLink} readOnly />
                </div>
                <Button type="button" onClick={() => copyInviteLink()}>
                  {copied ? (
                    <Fragment>
                      Copied
                      <HiOutlineCheck className="ml-1 w-5 h-5" />
                    </Fragment>
                  ) : (
                    <Fragment>
                      Copy
                      <HiOutlineClipboardCopy className="ml-1 h-5 w-5" />
                    </Fragment>
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="mt-2">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
