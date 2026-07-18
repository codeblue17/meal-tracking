import { memo } from "react";
import type { FC } from "react";
import { CloseButton, Dialog, Image } from "@chakra-ui/react";

type Props = {
  imageUrl: string | null;
  onClose: () => void;
};

export const ImageLightbox: FC<Props> = memo(({ imageUrl, onClose }) => {
  return (
    <Dialog.Root
      open={Boolean(imageUrl)}
      onOpenChange={(e) => !e.open && onClose()}
    >
      <Dialog.Backdrop bg="blackAlpha.700" />
      <Dialog.Positioner>
        <Dialog.Content
          bg="transparent"
          boxShadow="none"
          maxW="90vw"
          w="auto"
          position="relative"
        >
          <Dialog.CloseTrigger asChild>
            <CloseButton
              size="md"
              borderRadius="full"
              position="absolute"
              top={-12}
              right={0}
              color="white"
              bg="blackAlpha.600"
              _hover={{ bg: "blackAlpha.700" }}
            />
          </Dialog.CloseTrigger>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt=""
              maxH="85vh"
              maxW="90vw"
              objectFit="contain"
              borderRadius="lg"
              mx="auto"
            />
          )}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
});
