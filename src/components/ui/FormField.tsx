import type { FC, ReactNode } from "react";
import { Field } from "@chakra-ui/react";

type FormFieldProps = {
  label: string;
  children: ReactNode;
};

// ラベル＋入力欄の組。Field.Root 内の Input / Textarea は label と自動で関連付けられる
// （ラベルのクリックでフォーカスが移り、スクリーンリーダーもラベルを読み上げる）
export const FormField: FC<FormFieldProps> = ({ label, children }) => (
  <Field.Root gap={2}>
    <Field.Label color="gray.700">{label}</Field.Label>
    {children}
  </Field.Root>
);
