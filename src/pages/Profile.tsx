import { memo, useCallback, useState } from "react";
import type { FC } from "react";
import { Box, Tabs } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaLink, FaUser, FaUserCog } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountInfoSection } from "@/components/profile/AccountInfoSection";
import { ProfileEditSection } from "@/components/profile/ProfileEditSection";
import { GoalSection } from "@/components/profile/GoalSection";
import type { GoalType } from "@/constants/goal";
import { ShareSection } from "@/components/profile/ShareSection";
import { PasswordSection } from "@/components/profile/PasswordSection";
import { AccountActionsSection } from "@/components/profile/AccountActionsSection";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

const PROFILE_TABS = [
  { value: "profile", label: "プロフィール", icon: FaUser },
  { value: "share", label: "共有リンク", icon: FaLink },
  { value: "account", label: "アカウント", icon: FaUserCog },
] as const;

type ProfileTab = (typeof PROFILE_TABS)[number]["value"];

const DEFAULT_TAB: ProfileTab = "profile";

const isProfileTab = (value: string | null): value is ProfileTab =>
  PROFILE_TABS.some((tab) => tab.value === value);

export const Profile: FC = memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // 開いているタブは ?tab= に持たせ、リロードやリンクでも同じタブを開けるようにする
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const currentTab: ProfileTab = isProfileTab(tabParam)
    ? tabParam
    : DEFAULT_TAB;

  const handleTabChange = useCallback(
    ({ value }: { value: string }) => {
      setSearchParams(
        value === DEFAULT_TAB ? {} : { tab: value },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const openDeleteDialog = useCallback(() => setDeleteOpen(true), []);
  const closeDeleteDialog = useCallback(() => setDeleteOpen(false), []);

  const fullName = user?.user_metadata?.full_name as string | undefined;

  return (
    <Box
      bg="gray.50"
      minH="100svh"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 12 }}
    >
      <Box maxW="640px" mx="auto">
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.12)"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          {/* アバター・名前・メール */}
          <ProfileHeader fullName={fullName} email={user?.email} />

          <Tabs.Root
            value={currentTab}
            onValueChange={handleTabChange}
            variant="line"
            colorPalette="teal"
            fitted
            lazyMount
          >
            <Tabs.List borderColor="gray.100">
              {PROFILE_TABS.map(({ value, label, icon: Icon }) => (
                <Tabs.Trigger
                  key={value}
                  value={value}
                  py={6}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="semibold"
                  color="gray.500"
                  _selected={{ color: "teal.600" }}
                >
                  <Box as="span" hideBelow="sm">
                    <Icon />
                  </Box>
                  {label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="profile" p={0}>
              <ProfileEditSection initialFullName={fullName} />
              <GoalSection
                initialGoalType={
                  user?.user_metadata?.goal_type as GoalType | undefined
                }
                initialGoalDetail={
                  user?.user_metadata?.goal_detail as string | undefined
                }
              />
            </Tabs.Content>

            <Tabs.Content value="share" p={0}>
              <ShareSection />
            </Tabs.Content>

            <Tabs.Content value="account" p={0}>
              <AccountInfoSection
                email={user?.email}
                createdAt={user?.created_at}
              />
              <PasswordSection />
              <AccountActionsSection
                onSignOut={handleSignOut}
                onRequestDelete={openDeleteDialog}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>

      {/* 退会確認ダイアログ */}
      <DeleteAccountDialog open={deleteOpen} onClose={closeDeleteDialog} />
    </Box>
  );
});
