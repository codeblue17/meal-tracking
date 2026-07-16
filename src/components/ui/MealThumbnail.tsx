import { memo } from "react";
import type { FC } from "react";
import { Flex, Image } from "@chakra-ui/react";
import { FaUtensils } from "react-icons/fa";
import { getMealImageUrl } from "@/utils/imageUpload";

type Props = {
  imagePath: string | null;
  size?: string;
};

export const MealThumbnail: FC<Props> = memo(({ imagePath, size = "44px" }) => {
  const url = imagePath ? getMealImageUrl(imagePath) : null;

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
    >
      {url ? (
        <Image src={url} alt="" w="full" h="full" objectFit="cover" />
      ) : (
        <FaUtensils size={14} />
      )}
    </Flex>
  );
});
