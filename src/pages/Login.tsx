import { memo, useState } from "react";
import React from "react";
import type { FC } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { LogoIcon } from "../components/ui/LogoIcon";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";

export const Login: FC = memo(() => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch {
      toaster.create({
        title: "ログインに失敗しました",
        description: "メールアドレスまたはパスワードが正しくありません",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100svh"
      align="center"
      justify="center"
      bg="gray.50"
      px={{ base: 4, md: 8 }}
      py={{ base: 8, md: 12 }}
    >
      <Flex
        w="full"
        maxW="980px"
        minH={{ base: "auto", md: "620px" }}
        bg="white"
        borderRadius={{ base: "2xl", md: "3xl" }}
        overflow="hidden"
        boxShadow="0 24px 70px rgba(15, 23, 42, 0.12)"
        border="1px solid"
        borderColor="gray.100"
      >
        <Flex
          flex="1"
          display={{ base: "none", md: "flex" }}
          direction="column"
          justify="space-between"
          bg="teal.600"
          color="white"
          p={10}
          textAlign="left"
        >
          <Box>
            <LogoIcon boxSize={12} bg="whiteAlpha.300" fontSize="xl" mb={8} />
            <Heading
              as="h1"
              color="white"
              fontSize="4xl"
              lineHeight="1.15"
              mb={4}
            >
              毎日の食事を、
              <br />
              無理なく記録。
            </Heading>
            <Text color="teal.50" fontSize="md" lineHeight="1.8">
              食事履歴、体調、習慣の変化をひとつの場所で確認できます。
            </Text>
          </Box>
          <Box
            borderTop="1px solid"
            borderColor="whiteAlpha.300"
            pt={6}
            color="teal.50"
            fontSize="sm"
            lineHeight="1.8"
          >
            記録を続けるほど、自分に合う食生活が見えてきます。
          </Box>
        </Flex>

        <Flex
          as="form"
          onSubmit={handleSubmit}
          flex="1"
          direction="column"
          justify="center"
          px={{ base: 6, md: 12 }}
          py={{ base: 10, md: 12 }}
          textAlign="left"
        >
          <Box mb={8}>
            <Text color="teal.600" fontWeight="semibold" fontSize="sm" mb={3}>
              Meal Tracking
            </Text>
            <Heading
              as="h2"
              color="gray.900"
              fontSize={{ base: "2xl", md: "3xl" }}
              mb={3}
            >
              ログイン
            </Heading>
            <Text color="gray.500" fontSize="sm">
              アカウント情報を入力してください。
            </Text>
          </Box>

          <Stack gap={4}>
            <Box>
              <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                メールアドレス
              </Text>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                {...inputStyle}
              />
            </Box>
            <Box>
              <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                パスワード
              </Text>
              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                {...inputStyle}
              />
            </Box>
            <Flex justify="flex-end">
              <Link color="teal.600" fontSize="sm" fontWeight="medium">
                パスワードを忘れた方
              </Link>
            </Flex>
            <PrimaryButton
              type="submit"
              mt={2}
              loading={loading}
            >
              ログイン
            </PrimaryButton>
            <Flex justify="center" gap={1}>
              <Text color="gray.500" fontSize="sm">
                アカウントをお持ちでない方は
              </Text>
              <RouterLink to="/signup">
                <Text color="teal.600" fontSize="sm" fontWeight="medium">
                  新規登録
                </Text>
              </RouterLink>
            </Flex>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  );
});
