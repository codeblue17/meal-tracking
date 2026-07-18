import { memo } from "react";
import type { FC } from "react";
import { Flex, Image } from "@chakra-ui/react";
import { FaUtensils } from "react-icons/fa";
import { getMealImageUrl } from "@/utils/imageUpload";

type Props = {
  imagePath: string | null;
  size: string;
  onClick?: () => void;
};

export const MealThumbnail: FC<Props> = memo(({ imagePath, size, onClick }) => {
  const url = imagePath ? getMealImageUrl(imagePath) : null;
  const clickable = Boolean(url && onClick);

  return (
    <Flex
      boxSize={size}
      borderRadius="lg"
      overflow="hidden"
      bg="gray.100"
      color="gray.300"
      align="center"
      justify="center"
      flexShrink={0}
      cursor={clickable ? "pointer" : undefined}
      onClick={clickable ? onClick : undefined}
    >
      {url ? (
        <Image src={url} alt="" w="full" h="full" objectFit="cover" />
      ) : (
        <FaUtensils size={14} />
      )}
    </Flex>
  );
});
