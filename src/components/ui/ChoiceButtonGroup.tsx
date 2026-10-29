import { Button, Grid } from "@chakra-ui/react";

type ChoiceButtonGroupProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  // 未選択は ""
  value: T | "";
  onChange: (value: T) => void;
};

// 選択肢を横並びのボタンで表示し、1つだけ選ばせる。選択中のボタンは aria-pressed=true
export const ChoiceButtonGroup = <T extends string>({
  options,
  value,
  onChange,
}: ChoiceButtonGroupProps<T>) => (
  <Grid templateColumns={`repeat(${options.length}, 1fr)`} gap={2}>
    {options.map((option) => {
      const isSelected = value === option.value;
      return (
        <Button
          key={option.value}
          type="button"
          size="md"
          borderRadius="xl"
          variant={isSelected ? "solid" : "outline"}
          colorPalette={isSelected ? "teal" : "gray"}
          fontWeight={isSelected ? "semibold" : "medium"}
          aria-pressed={isSelected}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      );
    })}
  </Grid>
);
