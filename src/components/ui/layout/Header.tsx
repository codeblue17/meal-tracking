import {
  Flex,
  Heading,
  Link,
  Box,
  Button,
  IconButton,
  Drawer,
  CloseButton,
  HStack,
  Text,
} from "@chakra-ui/react";
import { LogoIcon } from "../LogoIcon";
import { memo, useState } from "react";
import type { FC } from "react";
import { FaBars, FaUserCircle, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MealFormModal } from "@/components/ui/MealFormModal";

const navItems = [
  { label: "ダッシュボード", path: "/dashboard" },
  { label: "食事履歴一覧", path: "/list" },
];

export const Header: FC = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const { signOut } = useAuth();

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <Flex
        as="nav"
        bg="white"
        color="gray.800"
        align="center"
        justify="space-between"
        px={{ base: 4, md: 8 }}
        py={{ base: 3, md: 4 }}
        borderBottom="1px solid"
        borderColor="gray.100"
        boxShadow="0 8px 24px rgba(15, 23, 42, 0.06)"
        position="sticky"
        top={0}
        zIndex="sticky"
      >
        <RouterLink to="/dashboard" style={{ outline: "none" }}>
          <Flex align="center" gap={3} mr={8} _hover={{ cursor: "pointer" }}>
            <LogoIcon
              boxSize={{ base: 9, md: 10 }}
              bg="teal.500"
              color="white"
              fontSize={{ base: "sm", md: "md" }}
              boxShadow="0 8px 18px rgba(20, 184, 166, 0.28)"
            />
            <Box textAlign="left">
              <Heading
                as="h1"
                fontSize={{ base: "md", md: "lg" }}
                lineHeight="1.1"
                color="gray.900"
              >
                Meal Tracking
              </Heading>
            </Box>
          </Flex>
        </RouterLink>
        <HStack
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
          gap={1}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Box key={item.path}>
                <Link
                  asChild
                  px={4}
                  py={2}
                  borderRadius="full"
                  color={isActive ? "teal.700" : "gray.600"}
                  bg={isActive ? "teal.50" : "transparent"}
                  fontWeight={isActive ? "semibold" : "medium"}
                  textDecoration="none"
                  transition="all 0.2s ease"
                  _hover={{
                    color: "teal.700",
                    bg: "teal.50",
                    textDecoration: "none",
                  }}
                >
                  <RouterLink to={item.path} style={{ outline: "none" }}>
                    {item.label}
                  </RouterLink>
                </Link>
              </Box>
            );
          })}
        </HStack>
        <HStack display={{ base: "none", md: "flex" }} gap={1}>
          <IconButton
            size="md"
            variant="ghost"
            aria-label="食事を記録"
            borderRadius="full"
            color="gray.600"
            onClick={() => setIsMealModalOpen(true)}
            _hover={{ bg: "teal.50", color: "teal.700" }}
          >
            <FaPlus size={18} />
          </IconButton>
          <RouterLink to="/profile" style={{ outline: "none" }}>
            <IconButton
              size="md"
              variant="ghost"
              aria-label="プロフィール"
              borderRadius="full"
              color={location.pathname === "/profile" ? "teal.700" : "gray.600"}
              bg={location.pathname === "/profile" ? "teal.50" : "transparent"}
              _hover={{ bg: "teal.50", color: "teal.700" }}
            >
              <FaUserCircle size={24} />
            </IconButton>
          </RouterLink>
          <IconButton
            size="md"
            variant="ghost"
            aria-label="サインアウト"
            borderRadius="full"
            color="gray.600"
            onClick={handleSignOut}
            _hover={{ bg: "red.50", color: "red.600" }}
          >
            <FaSignOutAlt size={20} />
          </IconButton>
        </HStack>
        <Drawer.Root
          placement="start"
          size="xs"
          open={isOpen}
          onOpenChange={(e) => setIsOpen(e.open)}
        >
          <Drawer.Trigger asChild>
            <IconButton
              size="md"
              variant="ghost"
              aria-label="メニューボタン"
              borderRadius="full"
              color="gray.700"
              display={{ base: "inline-flex", md: "none" }}
              _hover={{ bg: "gray.100" }}
            >
              <FaBars />
            </IconButton>
          </Drawer.Trigger>
          <Drawer.Backdrop bg="blackAlpha.400" />
          <Drawer.Positioner>
            <Drawer.Content borderRightRadius="2xl">
              <Drawer.Header borderBottom="1px solid" borderColor="gray.100">
                <Drawer.Title>
                  <Flex align="center" gap={3}>
                    <LogoIcon
                      boxSize={9}
                      bg="teal.500"
                      color="white"
                    />
                    <Box>
                      <Text fontWeight="bold" color="gray.500">
                        Meal Tracking
                      </Text>
                    </Box>
                  </Flex>
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body pt={5}>
                <Button
                  w="100%"
                  mb={3}
                  justifyContent="flex-start"
                  borderRadius="lg"
                  colorPalette="teal"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMealModalOpen(true);
                  }}
                >
                  ＋ 食事を記録
                </Button>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <Button
                      key={item.path}
                      w="100%"
                      mb={2}
                      justifyContent="flex-start"
                      borderRadius="lg"
                      variant={isActive ? "solid" : "ghost"}
                      colorPalette={isActive ? "teal" : "gray"}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  w="100%"
                  mb={2}
                  justifyContent="flex-start"
                  borderRadius="lg"
                  variant={location.pathname === "/profile" ? "solid" : "ghost"}
                  colorPalette={
                    location.pathname === "/profile" ? "teal" : "gray"
                  }
                  onClick={() => handleNavigate("/profile")}
                >
                  プロフィール
                </Button>
                <Button
                  w="100%"
                  justifyContent="flex-start"
                  borderRadius="lg"
                  variant="ghost"
                  colorPalette="red"
                  onClick={handleSignOut}
                >
                  サインアウト
                </Button>
              </Drawer.Body>
              <Drawer.Footer />
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" borderRadius="full" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      </Flex>
      <MealFormModal
        open={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
      />
    </>
  );
});
