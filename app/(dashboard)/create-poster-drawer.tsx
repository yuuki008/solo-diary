import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export default function CreatePosterDrawer() {
  return (
    <Drawer>
      <DrawerTrigger className="fixed w-full bottom-4 left-0 flex justify-center">
        <Button className="rounded-full" size="lg">
          <Plus />
          New Post
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>New Post</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col px-4">
            <Textarea placeholder="What's on your mind?" />
          </div>
          <DrawerFooter>
            <Button className="w-full">Post</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
