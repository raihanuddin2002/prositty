"useClient";

import React, { Dispatch, Fragment, SetStateAction, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Cropper, { Area, Point } from "react-easy-crop";
import getCroppedImg from "@/lib/image";
import { useToast } from "../ui/use-toast";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { HiOutlineCheckCircle, HiOutlineUpload } from "react-icons/hi";
import { Loader2 } from "lucide-react";

export interface ImageCropProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  originalImage: string | null;
  uploadAvatar: (blob: Blob) => Promise<
    | {
        id: string;
        dismiss: () => void;
      }
    | undefined
  >;
}

export default function ImageCrop({
  open,
  setOpen,
  originalImage,
  uploadAvatar,
}: ImageCropProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPx, setCroppedAreaPx] = useState<Area | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPx(croppedAreaPixels);
  };

  const cropSetImage = async () => {
    try {
      setLoading(true);
      getCroppedImg(originalImage as string, croppedAreaPx as Area).then(
        function (blob) {
          if (!blob)
            return toast({
              title: "An error has occured!",
              description: "There was an unknown error updating your avatar.",
              variant: "destructive",
            });

          uploadAvatar(blob);
          setOpen(false);
          setLoading(false);
        }
      );
    } catch (e) {
      return toast({
        title: "An error has occured!",
        description: "There was an unknown error updating your avatar.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Crop your image</AlertDialogTitle>
          <AlertDialogDescription>
            Postion your image using the the view and click Upload when done.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="relative w-full h-96">
          <Cropper
            image={originalImage as string}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="zoom" className="text-lg">
            Zoom
          </Label>
          <Slider
            onValueChange={(n) => setZoom(n[0])}
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            id="zoom"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={() => cropSetImage()} disabled={loading}>
            {loading ? (
              <Fragment>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Fragment>
            ) : (
              <Fragment>
                <HiOutlineUpload className="w-5 h-5 mr-2" />
                Upload
              </Fragment>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
