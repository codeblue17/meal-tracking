import {
  Flex,
  Heading,
  Link,
  Box,
  Button,
  IconButton,
  Drawer,
  CloseButton,
} from "@chakra-ui/react";
import { memo, useState } from "react";
import type { FC } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const navItems = [
  { label: "ダッシュボード", path: "/dashboard" },
  { label: "食事履歴一覧", path: "/list" },
];

export const Header: FC = memo(() => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <Flex
        as="nav"
        bg="teal.500"
        color="gray.50"
        align="center"
        justify="space-between"
        padding={{ base: 3, md: 5 }}
      >
        <RouterLink to="/dashboard" style={{ outline: "none" }}>
          <Flex align="center" mr={8} _hover={{ cursor: "pointer" }}>
            <Heading as="h1" fontSize={{ base: "md", md: "lg" }}>
              食事管理アプリ
            </Heading>
          </Flex>
        </RouterLink>
        <Flex
          align="center"
          fontSize="sm"
          flexGrow={2}
          display={{ base: "none", md: "flex" }}
        >
          {navItems.map((item) => (
            <Box key={item.path} pr={4}>
              <Link asChild color="gray.50">
                <RouterLink to={item.path} style={{ outline: "none" }}>{item.label}</RouterLink>
              </Link>
            </Box>
          ))}
        </Flex>
        <RouterLink to="/profile" style={{ outline: "none" }}>
          <IconButton
            size="sm"
            variant="plain"
            aria-label="プロフィール"
            display={{ base: "none", md: "flex" }}
          >
            <FaUserCircle color="white" size={24} />
          </IconButton>
        </RouterLink>
        <Drawer.Root placement="start" size="xs" open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
          <Drawer.Trigger asChild>
            <IconButton
              size="sm"
              variant="plain"
              aria-label="メニューボタン"
              display={{ base: "block", md: "none" }}
            >
              <FaBars color="white" />
            </IconButton>
          </Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title />
              </Drawer.Header>
              <Drawer.Body>
                {navItems.map((item) => (
                  <Button key={item.path} w="100%" mb={2} onClick={() => handleNavigate(item.path)}>
                    {item.label}
                  </Button>
                ))}
                <Button w="100%" mb={2} onClick={() => handleNavigate("/profile")}>
                  プロフィール
                </Button>
              </Drawer.Body>
              <Drawer.Footer />
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      </Flex>
    </>
  );
});
