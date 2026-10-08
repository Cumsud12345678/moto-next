'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Listing } from "./columns"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

interface GalleryDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  listing: Listing | undefined
}

export function GalleryDialog({ open, setOpen, listing }: GalleryDialogProps) {


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Carousel>
                <CarouselContent>
                  {
                    listing?.video 
                    &&
                    (
                      <CarouselItem key={listing.video}>
                        <video
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${listing.video}`}
                          controls
                          className="aspect-video w-full object-cover"
                        />
                      </CarouselItem>
                    )
                  }
                  {
                    listing?.images.map((image: string) => (
                      <CarouselItem key={image}>
                        <Image src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${image}`} alt="" width={400} height={100} />
                      </CarouselItem>
                    ))
                  }
                  {/* <CarouselItem>...</CarouselItem> */}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
