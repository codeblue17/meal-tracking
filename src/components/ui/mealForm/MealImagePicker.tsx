import { memo, useRef } from "react";
import type { ChangeEvent, FC } from "react";
import { Box, Flex, IconButton, Image, Input, Text } from "@chakra-ui/react";
import { FaCamera, FaTimes } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster-instance";
import { isImageFile, MAX_IMAGE_FILE_SIZE } from "@/utils/imageUpload";

type MealImagePickerProps = {
  // 表示中の画像（既存画像の公開 URL、または選択したファイルの blob URL）
  previewUrl: string | null;
  // 画像形式・サイズのチェックを通ったファイルだけが渡される
  onSelect: (file: File) => void;
  onRemove: () => void;
};

export const MealImagePicker: FC<MealImagePickerProps> = memo(
  ({ previewUrl, onSelect, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // 同じファイルを選び直しても change が発火するようにリセットする
      e.target.value = "";
      if (!file) return;
      if (!isImageFile(file)) {
        toaster.create({ title: "画像ファイルを選択してください", type: "error" });
        return;
      }
      if (file.size > MAX_IMAGE_FILE_SIZE) {
        toaster.create({
          title: "画像サイズは10MB以内にしてください",
          type: "error",
        });
        return;
      }
      onSelect(file);
    };

    return (
      <>
        <Box
          position="relative"
          w="full"
          h="160px"
          borderRadius="xl"
          border="1px dashed"
          borderColor="gray.200"
          bg="gray.50"
          overflow="hidden"
          cursor="pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <>
              <Image
                src={previewUrl}
                alt=""
                w="full"
                h="full"
                objectFit="cover"
              />
              <IconButton
                size="xs"
                borderRadius="full"
                position="absolute"
                top={2}
                right={2}
                aria-label="写真を削除"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: "blackAlpha.700" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <FaTimes size={12} />
              </IconButton>
            </>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="full"
              color="gray.400"
              gap={1.5}
            >
              <FaCamera size={20} />
              <Text fontSize="xs">タップして写真を追加</Text>
            </Flex>
          )}
        </Box>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          display="none"
          onChange={handleFileChange}
        />
      </>
    );
  },
);
