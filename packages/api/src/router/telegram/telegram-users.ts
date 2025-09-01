import { getLinkedUser } from "./get-linked-user";
import { checkUserLinkStatus } from "./check-user-link-status";
import { linkUser } from "./link-user";
import { unlinkUser } from "./unlink-user";
import { getMyLinkedAccounts } from "./get-my-linked-accounts";

export const telegramUsersRouter = {
  getLinkedUser,
  checkUserLinkStatus,
  linkUser,
  unlinkUser,
  getMyLinkedAccounts,
};
