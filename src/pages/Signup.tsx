import { memo, useState } from "react";
import React from "react";
import type { FC } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { LogoIcon } from "../components/ui/LogoIcon";
import { useAuth } from "@/hooks/useAuth";
import { toaster } from "@/components/ui/toaster-instance";

export const Signup: FC = memo(() => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toaster.create({
        title: "パスワードが一致しません",
        description: "パスワードと確認用パスワードを同じ値にしてください",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation) {
        toaster.create({
          title: "確認メールを送信しました",
          description: "メールに記載のリンクをクリックしてアカウントを有効化してください",
          type: "success",
        });
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch {
      toaster.create({
        title: "登録に失敗しました",
        description: "入力内容を確認してもう一度お試しください",
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
            <LogoIcon
              boxSize={12}
              bg="whiteAlpha.300"
              fontSize="xl"
              mb={8}
            />
            <Heading
              as="h1"
              color="white"
              fontSize="4xl"
              lineHeight="1.15"
              mb={4}
            >
              はじめての一歩を、
              <br />
              今日から。
            </Heading>
            <Text color="teal.50" fontSize="md" lineHeight="1.8">
              アカウントを作成して、食事の記録をはじめましょう。
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
              アカウント作成
            </Heading>
            <Text color="gray.500" fontSize="sm">
              メールアドレスとパスワードを入力してください。
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
                size="lg"
                borderRadius="xl"
                bg="gray.50"
                borderColor="gray.200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                }}
              />
            </Box>
            <Box>
              <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                パスワード
              </Text>
              <Input
                type="password"
                placeholder="8文字以上"
                size="lg"
                borderRadius="xl"
                bg="gray.50"
                borderColor="gray.200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                }}
              />
            </Box>
            <Box>
              <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                パスワード（確認）
              </Text>
              <Input
                type="password"
                placeholder="もう一度入力"
                size="lg"
                borderRadius="xl"
                bg="gray.50"
                borderColor="gray.200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                }}
              />
            </Box>
            <Button
              type="submit"
              size="lg"
              borderRadius="xl"
              colorPalette="teal"
              mt={2}
              loading={loading}
              boxShadow="0 12px 24px rgba(20, 184, 166, 0.22)"
            >
              アカウントを作成
            </Button>
            <Flex justify="center" gap={1}>
              <Text color="gray.500" fontSize="sm">
                すでにアカウントをお持ちの方は
              </Text>
              <RouterLink to="/">
                <Text color="teal.600" fontSize="sm" fontWeight="medium">
                  ログイン
                </Text>
              </RouterLink>
            </Flex>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  );
});
