// 共有リンクの URL（/share/:token は認証不要の共有閲覧ページ）
export const buildShareUrl = (token: string): string =>
  `${window.location.origin}/share/${token}`;
