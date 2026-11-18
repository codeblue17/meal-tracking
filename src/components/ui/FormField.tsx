import type { FC, ReactNode } from "react";
import { Field } from "@chakra-ui/react";
import type { FieldLabelProps } from "@chakra-ui/react";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  // ラベルの太さ（省略時は Chakra の既定 = medium）
  labelFontWeight?: FieldLabelProps["fontWeight"];
};

// ラベル＋入力欄の組。Field.Root 内の Input / Textarea は label と自動で関連付けられる
// （ラベルのクリックでフォーカスが移り、スクリーンリーダーもラベルを読み上げる）
export const FormField: FC<FormFieldProps> = ({
  label,
  children,
  labelFontWeight,
}) => (
  <Field.Root gap={2}>
    <Field.Label color="gray.700" fontWeight={labelFontWeight}>
      {label}
    </Field.Label>
    {children}
  </Field.Root>
);
