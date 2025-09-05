import { checkUserLinkStatus } from "./check-user-link-status";
import { getLinkedUser } from "./get-linked-user";

export const telegramUsersRouter = {
  getLinkedUser,
  checkUserLinkStatus,
};
