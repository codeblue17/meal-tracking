import { memo } from "react";
import type { FC } from "react";
import { Button, HStack } from "@chakra-ui/react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

// 1ページしかない場合は何も表示しない
export const Pagination: FC<PaginationProps> = memo(
  ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
      <HStack justify="center" gap={2} mt={8}>
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          borderRadius="full"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          前へ
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => {
            const isCurrent = pageNumber === currentPage;
            return (
              <Button
                key={pageNumber}
                size="sm"
                borderRadius="full"
                variant={isCurrent ? "solid" : "ghost"}
                colorPalette={isCurrent ? "teal" : "gray"}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          },
        )}
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          borderRadius="full"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          次へ
        </Button>
      </HStack>
    );
  },
);
