"use client";
import { Fragment, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import { useToast } from "@/components/ui/use-toast";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemsProps } from "@/components/header/items";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { getInitials } from "@/lib/utils";
import ImageCrop from "./img-crop";
import { HiOutlineInformationCircle, HiOutlineSave } from "react-icons/hi";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";

import crypto from "crypto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { setKey, fromLatLng, fromAddress } from "react-geocode";

const userProfileForm = z.object({
  fullName: z.string().max(70).optional(),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message:
        "A username cannot feature spaces, and can only contain characters like dash(-), dot(.), underscore(_)",
    })
    .min(3)
    .max(24),
  website: z
    .string()
    .regex(
      /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
      { message: "The link you entered is not a valid url!" }
    )
    .max(190)
    .optional()
    .or(z.literal("")),
  shortDescription: z.string().max(500).optional(),
  hobbies: z.string().max(90).optional(),
  address: z.string().max(90).optional(),
  dob: z.string().optional(),
  belief: z.string().max(50).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  race: z.string().max(60).optional(),
  education: z.string().max(80).optional(),
  profession: z.string().max(80).optional(),
  city: z.string().max(100),
  country: z.string().max(100),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.any(),
  }).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional()
});

export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

export default function AccountForm({ session, userData }: ItemsProps) {

  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [avatarPath, setAvatarPath] = useState<string | null | undefined>(
    userData?.avatar_url
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [cropDialogOpen, setCropDialogOpen] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [position, setPosition] = useState<any>(null);

  const user = session?.user;

  const { toast } = useToast();

  const searchParams = useSearchParams();
  const loginSuccess = searchParams.get("login");

  const form = useForm<z.infer<typeof userProfileForm>>({
    resolver: zodResolver(userProfileForm),
    defaultValues: {
      username: userData?.username || "",
      fullName: userData?.full_name || "",
      website: userData?.website || "",
      gender: userData?.gender || undefined,
      address: userData?.address || "",
      dob: userData?.dob || undefined,
      race: userData?.race || "",
      belief: userData?.belief || "",
      education: userData?.education || "",
      profession: userData?.profession || "",
      hobbies: userData?.hobbies || "",
      shortDescription: userData?.short_description || "",
      city: userData?.city || "",
      country: userData?.country || "",
      location: userData?.location || {
        type: "Point",
        coordinates: null,
      },
      latitude: userData?.latitude || null,
      longitude: userData?.latitude || null,
    },
  });


  useEffect(() => {
    // console.log(userData)
    setKey(process.env.NEXT_PUBLIC_MAPS_API_KEY as string);
    //initializeMap()
    if (userData && (userData?.latitude == null || userData?.longitude == null)) {
      setPosition({ lat: 0, lng: 0 })
    } else {
      setPosition({ lat: userData?.latitude, lng: userData?.longitude })
    }
  }, []);

  const initializeMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLng = { lat: latitude, lng: longitude };
          if (userData?.city == undefined || userData?.country == undefined) {
            //setAddress(latLng);
          }
          if (userData && (userData?.latitude == null || userData?.longitude == null)) {
            setPosition(latLng)
          } else {
            setPosition({ lat: userData?.latitude, lng: userData?.longitude })
          }
        },
        (error) => {
          console.error('Error Code = ' + error.code + ' - ' + error.message);
        },
        { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

  };
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
      } catch (error) {
        return toast({
          title: "An error has occured!",
          description:
            "There was an unknown error fetching your profile picture.",
          variant: "destructive",
        });
      }
    }

    if (avatarPath) downloadImage(avatarPath);
  }, [avatarPath, supabase, toast]);
  useEffect(() => {
    if (userData && position) {
      if (userData["location"] == null) userData['location'] = {
        type: "Point",
        coordinates: []
      }
      userData['location']['coordinates'] = [position.lng, position.lat]
      console.log(position)
    }
  }, [position])

  const setAddress = async (latLng: any) => {
    try {
      let address: any = await getAddress(latLng)
      if (address) {
        form.setValue('city', address.city);
        form.setValue('country', address.country);
        // form.setValue('address', address.address);
      }
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * get address from latLng using google geocoder service
   * @param latLng 
   * @returns promise
   */
  const getAddress = (latLng: any) => {
    return new Promise((resolve, reject) => {
      fromLatLng(latLng.lat, latLng.lng)
        .then(({ results }) => {
          if (results[0]) {
            const addressComponents = results[0].address_components;
            // console.log(addressComponents)
            let city = '';
            let country = '';
            let address = results[0].formatted_address;

            for (const component of addressComponents) {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              // else if (component.types.includes("administrative_area_level_1")) {
              //   city = component.long_name;
              // }
              else if (component.types.includes('postal_town')) {
                city = component.long_name;
              }
              else if (component.types.includes('country')) {
                country = component.long_name;
              }
            }
            resolve({ city, country, address });
          } else {
            reject('No results found');
            console.error('No results found');
          }
        })
        .catch((error) => { reject(error) })
    })
  }
  /**
   * get latLng from address using google geocoder service
   * @param address 
   * @returns promise
   */
  const getLatLng = (address: string) => {
    return new Promise((resolve, reject) => {
      fromAddress(address)
        .then(({ results }) => {
          if (results[0]) {
            const { lat, lng } = results[0].geometry.location;
            resolve({ lat: lat, lng: lng });
          } else {
            reject('No results found');
            console.error('No results found');
          }
        })
        .catch((error) => { reject(error) })
    })
  }
  const handleCityChange = async (event: any) => {
    const fieldData = form.getValues();
    const value = event.target.value;
    if (value && fieldData.country) {
      try {
        let latLng: any = await getLatLng(value + ", " + fieldData.country)
        // console.log(latLng)
        if (latLng) {
          setPosition(latLng)
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const handleCountryChange = async (event: any) => {
    const fieldData = form.getValues();
    const value = event.target.value;
    if (value && fieldData.city) {
      try {
        let latLng: any = await getLatLng(fieldData.city + ", " + value)
        // console.log(latLng)
        if (latLng) {
          setPosition(latLng)
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  async function updateProfile(data?: z.infer<typeof userProfileForm>) {
    setLoading(true);
    try {
      let saveParams = {
        id: user?.id as string,
        full_name: data?.fullName || null,
        username: (data?.username as string) || (userData?.username as string),
        website: data?.website || null,
        short_description: data?.shortDescription || null,
        race: data?.race || null,
        dob: data?.dob || null,
        belief: data?.belief || null,
        education: data?.education || null,
        profession: data?.profession || null,
        hobbies: data?.hobbies || null,
        gender: data?.gender || null,
        address: data?.address || null,
        city: data?.city || null,
        country: data?.country || null,
        avatar_url: avatarPath,
        location: { coordinates: [position.lng, position.lat], type: "Point" },
        latitude: position.lat || null,
        longitude: position.lng || null,
        updated_at: new Date().toISOString(),
      }
      // console.log(saveParams)
      let { error } = await supabase.from("profiles").upsert(saveParams);
      if (error && error.code === "23505") {
        form.setError("username", {
          type: "custom",
          message: "This username is taken!",
        });
        return toast({
          title: "An error has occured!",
          description: "A user with this username already exists!",
          variant: "destructive",
        });
      } else if (error) {
        return toast({
          title: "An error has occured!",
          description: "There was an unknown error updating your profile data.",
          variant: "destructive",
        });
      }
      toast({
        title: "Success!",
        description: "Your user profile was updated successfully.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "An error has occured!",
        description: "There was an unknown error updating your user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(values: z.infer<typeof userProfileForm>) {
    updateProfile(values);
  }

  const uploadAvatar = async (blob: Blob) => {
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

      const filePath = `${session?.user.id}/${crypto
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

      let { error } = await supabase.from("profiles").upsert({
        id: session?.user?.id as string,
        avatar_url: uploadPath?.path,
        updated_at: new Date().toISOString(),
        username: userData?.username as string,
      });

      if (error) {
        return toast({
          title: "An error has occured!",
          description: "There was an unknown error updating your avatar.",
          variant: "destructive",
        });
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
  };

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
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
  };

  const initials = getInitials(userData?.full_name);

  return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-6 mt-4 md:mt-0 md:mb-8">
        <TooltipProvider>
          <Tooltip delayDuration={400} defaultOpen={!userData?.avatar_url}>
            <TooltipTrigger>
              <label
                className="block rounded-full cursor-pointer ring-offset-2 ring-gray-200 ring-2 hover:ring-primary transition-all duration-100"
                htmlFor="image"
              >
                <Avatar className="h-20 w-20">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin m-auto text-gray-300" />
                  ) : (
                    <Fragment>
                      <AvatarImage
                        alt={userData?.full_name || "Your user image"}
                        src={avatarUrl || undefined}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Fragment>
                  )}
                </Avatar>
              </label>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={7}>
              <p>Click on your image to upload an avatar</p>
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
        <div>
          <div className="text-2xl font-bold">
            {userData?.full_name || userData?.username}
          </div>
          <div className="text-zinc-500 dark:text-zinc-400">
            {session?.user.email}
          </div>
        </div>
      </div>
      <Card className="w-full max-w-lg md:max-w-2xl">
        {loginSuccess && (
          <div className="p-3">
            <Alert variant="success">
              <HiOutlineInformationCircle className="h-5 w-5" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                You have logged in successfully!
              </AlertDescription>
            </Alert>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Edit your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 flex flex-col">
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={session?.user.email} disabled />
                </FormControl>
                <FormDescription>
                  This is your account email, you cannot change it.
                </FormDescription>
                <FormMessage />

              </FormItem>
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Controller
                    name="city"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} onBlur={handleCityChange} />
                      // <Input value={userData?.city || ""}  />
                    )}
                  />

                </FormControl>
                {/* <FormDescription>
                  You cannot change your city as it is detected automatically.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Controller
                    name="country"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} onBlur={handleCountryChange} />
                    )}
                  />
                  {/* <Input value={userData?.country || ""}  /> */}
                </FormControl>
                {/* <FormDescription>
                  You cannot change your country as it is detected
                  automatically.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
              <div>
                <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
                  <Map
                    zoom={7}
                    center={position}
                    gestureHandling={"greedy"}
                    disableDefaultUI={true}
                    mapId="cbe64bbb3d6efc19"
                    className="w-full h-[65vh] rounded-lg mt-3"
                  >
                    <AdvancedMarker position={position}
                      draggable={true}
                      className="bg-white/90 rounded-lg p-1.5"
                      onDragEnd={(event: any) => {
                        setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() })
                        setAddress({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                      }}
                    >
                      <Avatar className="h-9 w-9 mx-auto">
                        <AvatarImage
                          alt={userData?.username || `${userData?.username}'s profile picture`}
                          src={avatarUrl || undefined}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold">{userData?.username}</p>
                    </AdvancedMarker>

                  </Map>
                </APIProvider>
                <style jsx global>{`
                .custom-marker {
                  position:relative;
                }
                .markerAvatar {
                  position: absolute;
                  top: 8px;
                  left: 12px;
                }
              `}</style>
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your publicly displayed username.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your full name above.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select your gender above.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Format: YYYY/DD/MM"
                        type="text"
                        max={100}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your legal date of birth.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Controller
                        name="address"
                        control={form.control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Enter your address" />
                        )}
                      />
                      {/* <Input placeholder="Enter your address" {...field} /> */}
                    </FormControl>
                    <FormDescription>
                      Enter your address or a location above.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your race" {...field} />
                    </FormControl>
                    <FormDescription>Enter your race above.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="belief"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Belief</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your belief" {...field} />
                    </FormControl>
                    <FormDescription>Enter your belief above.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your education" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter data about your education above.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your profession" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your current profession above.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hobbies</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your hobbies" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your favorite hobbies above.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your website" {...field} />
                    </FormControl>
                    <FormDescription>
                      Show off a link your website.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A short description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a short description about yourself.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" type="submit" disabled={loading}>
                {loading ? (
                  <Fragment>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Fragment>
                ) : (
                  <Fragment>
                    <HiOutlineSave className="w-5 h-5 mr-2" />
                    Save
                  </Fragment>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <ImageCrop
        open={cropDialogOpen}
        setOpen={setCropDialogOpen}
        uploadAvatar={uploadAvatar}
        originalImage={originalImage}
      />
    </div>
  );
}
