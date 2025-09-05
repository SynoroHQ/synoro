import { checkUserLinkStatus } from "./check-user-link-status";
import { getLinkedUser } from "./get-linked-user";

// import { linkUser } from "./link-user"; // DEPRECATED
// import { unlinkUser } from "./unlink-user"; // DEPRECATED

export const telegramUsersRouter = {
  getLinkedUser,
  checkUserLinkStatus,
  // linkUser, // DEPRECATED - пользователи создаются автоматически
  // unlinkUser, // DEPRECATED - пользователи создаются автоматически
};
