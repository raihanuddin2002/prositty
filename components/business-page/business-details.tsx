"use client"


import { Loader2 } from 'lucide-react'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { toast } from '../ui/use-toast'
import { UserData } from '../header/items'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { TooltipProvider } from '../ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import ImageCrop from '../account/img-crop'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types_db'
import crypto from "crypto";
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { HiOutlinePencil } from 'react-icons/hi'

type Props = {
    userData: UserData | null
    businessPageDetails: BusinessPageDetails | null
}
export type BusinessPageDetails = Database["public"]["Tables"]["business-page"]["Row"]

export default function BusinessPageDetails({ userData, businessPageDetails }: Props) {
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [description, setDescription] = useState(businessPageDetails?.description || '');
    const [editMode, setEditMode] = useState(false)
    const [avatarPath, setAvatarPath] = useState<string | null | undefined>(businessPageDetails?.avatar_url);
    const [cropDialogOpen, setCropDialogOpen] = useState<boolean>(false);
    const [originalImage, setOriginalImage] = useState<string | null>(null);

    // get avatar url
    useEffect(() => {
        let ignore = false

        async function downloadImage(path: string) {
            try {
                const { data, error } = await supabase.storage
                    .from("avatars")
                    .download(path);
                if (error) {
                    throw error;
                }

                if (!ignore) {
                    const url = URL.createObjectURL(data);
                    setAvatarUrl(url);
                }

            } catch (error) {
                console.log("Error downloading image:", error);
            }
        }

        if (avatarPath) downloadImage(avatarPath)

        return () => {
            ignore = true
        }
    }, [avatarPath, supabase])

    const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(async (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return toast({
                title: "An error has occured!",
                description: "You have to select an image to set it as your avatar!",
                variant: "destructive",
            });
        }

        setOriginalImage(null);

        let reader: FileReader = new FileReader();

        reader.onload = function (e) {
            let dataURI: string = e.target?.result as string;

            setOriginalImage(dataURI);
            setCropDialogOpen(true);
        };

        reader.readAsDataURL(event.target.files[0]);

        // eslint-disable-next-line
    }, []);

    const uploadAvatar = useCallback(async (blob: Blob) => {
        setUploading(true);

        try {
            if (userData?.avatar_url) {
                const { data, error: deleteError } = await supabase.storage
                    .from("avatars")
                    .remove([userData?.avatar_url]);

                if (deleteError) {
                    return toast({
                        title: "An error has occured!",
                        description: "There was an unknown error updating your avatar.",
                        variant: "destructive",
                    });
                }
            }

            const filePath = `${userData?.id}/${crypto
                .randomBytes(20)
                .toString("hex")}.jpeg`;

            let { data: uploadPath, error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, blob);

            if (uploadError) {
                return toast({
                    title: "An error has occured!",
                    description: "There was an unknown error updating your avatar.",
                    variant: "destructive",
                });
            }

            const businessPageData = {
                created_by: userData?.id as string,
                avatar_url: uploadPath?.path || null,
                description: description || null,
            }

            if (businessPageDetails) {
                const { error } = await supabase.from("business-page")
                    .update(businessPageData)
                    .eq("created_by", userData?.id as string);

                if (error) {
                    return toast({
                        title: "An error has occured!",
                        description: "There was an unknown error updating your avatar.",
                        variant: "destructive",
                    });
                }
            } else {
                let { error } = await supabase.from("business-page").upsert(businessPageData);

                if (error) {
                    return toast({
                        title: "An error has occured!",
                        description: "There was an unknown error updating your avatar.",
                        variant: "destructive",
                    });
                }
            }

            setAvatarPath(filePath);
            router.refresh();

            toast({
                title: "Success!",
                description: "Your user profile was updated successfully.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "An error has occured!",
                description: "There was an unknown error updating your avatar.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }

        // eslint-disable-next-line
    }, []);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            await supabase.from("business-page")
                .update({
                    description: description || null,
                })
                .eq("created_by", userData?.id as string);

            setEditMode(false)

            toast({
                title: "Success!",
                description: "Your business profile was updated successfully.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "An error has occured!",
                description: "There was an unknown error updating your business profiles.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="mb-10">
                <TooltipProvider>
                    <Tooltip delayDuration={400}>
                        <TooltipTrigger>
                            <label
                                className="block rounded-full cursor-pointer ring-offset-2 ring-gray-200 ring-2 hover:ring-primary transition-all duration-100"
                                htmlFor="image"
                            >
                                <Avatar className="h-32 w-32">
                                    {uploading ? (
                                        <Loader2 className="h-20 w-20 animate-spin m-auto text-gray-300" />
                                    ) : (
                                        <Fragment>
                                            <AvatarImage
                                                alt={"Your user image"}
                                                src={avatarUrl || undefined}
                                            />
                                            <AvatarFallback />
                                        </Fragment>
                                    )}
                                </Avatar>
                            </label>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={7}>
                            <p>Click to upload a logo</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <input
                    className="absolute hidden"
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                />

                <ImageCrop
                    open={cropDialogOpen}
                    setOpen={setCropDialogOpen}
                    uploadAvatar={uploadAvatar}
                    originalImage={originalImage}
                />
            </div>

            <div>
                <h2 className="text-xl font-[500] mb-3 flex items-center gap-2">
                    Description
                    {!editMode && <span
                        className="text-gray-500 p-1 border border-primary rounded-full cursor-pointer"
                        onClick={() => setEditMode(true)}
                        title="Edit description"
                    >
                        <HiOutlinePencil className="w-3 h-3 text-primary" />
                    </span>}
                </h2>

                {editMode ? (
                    <div>
                        <Textarea
                            className='mb-3'
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSubmit}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                            </Button>

                            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </>
    )
}
