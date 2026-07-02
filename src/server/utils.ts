import {
  reddit,
  context
} from "@devvit/web/server";

// Helper function to send a message to a user
export async function sendMessageToUser(username: string, messageText: string, sendAsSubreddit: boolean) {
  if (messageText === '')
    return; // If there is no message text, do nothing
  const subredditName = context.subredditName as string;
  const subjectText = `You have been unbanned from r/${subredditName}`;
  try {
    if (sendAsSubreddit) { // Send as modmail.
      const newConvo = await reddit.modMail.createConversation({
        subject: subjectText,
        body: messageText,
        to: username,
        isAuthorHidden: true,
        subredditName: subredditName,
      });
      // Archive the modmail conversation after sending.
      try { await reddit.modMail.archiveConversation(newConvo.conversation.id!) }
      catch {} // Catch needed in case for some reason message is sent to mod, as mod discussions can't be archived.
    }
    else { // Send as bot account.
      messageText += `\n\n---\n\n*This inbox is not monitored. If you have any questions, please message the moderators of r/${subredditName}.*`;
      await reddit.sendPrivateMessage({
        subject: subjectText,
        text: messageText,
        to: username,
      });
    }
  }
  catch (error) { // Log specific error messages
    if (error == "NOT_WHITELISTED_BY_USER_MESSAGE")
      console.log(`Error: Message not sent. u/${username} likely has chat/messaging disabled or has blocked the u/unban-message app account.`);
    else console.log(`Error: Message not sent to u/${username}.`);
  }
}

// Helper function to determine if this was a temporary ban which expired.
export async function wasBanTemporary(username: string) {
  await delay(10); // Wait 10 seconds to allow mod log to update.
  const unbanLog = await reddit.getModerationLog({
    subredditName: context.subredditName as string,
    limit: 20,
    type: "unbanuser",
   }).all();
   for (const unban of unbanLog) {
     if (unban.target?.author === username) {
       const description = unban.description ?? "";
       const details = unban.details ?? "";
       const unbanInfo = `${description} ${details}`;
       return unbanInfo.includes("was temporary");
     }
   }
   return false;
}

// Helper function to find out if a specific mod's action is ignored
export function isModIgnored(username: string, modWhitelist: string, modBlacklist: string) {
  // If whitelist is not empty, use that.
  if (modWhitelist != undefined && modWhitelist.trim() != '')
    return !isModInList(username, modWhitelist.trim());
  // Whitelist is empty. Check blacklist.
  if (modBlacklist != undefined && modBlacklist.trim() != '')
    return isModInList(username, modBlacklist.trim());
  // If both whitelist and blacklist are empty, mod is not ignored. Return false.
  return false;
}

// Helper function to find out if a mod's username is in the whitelist or blacklist
function isModInList(username: string, modList: string) {
  const modUsernames = modList.split(',');
  for (let i = 0; i < modUsernames.length; i++) {
    if (username == modUsernames[i]) return true;
  }
  return false;
}

// Helper function to get the values from the raw JSON request body.
export function getRequestBodyValue(body: any, ...paths: Array<string[]>) {
  for (const path of paths) {
    let current: any = body;
    let found = true;
    for (const key of path) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        found = false;
        break;
      }
      current = current[key];
    }
    if (found && current != null && current !== '') {
      return String(current);
    }
  }
  return '';
}

// Helper function for when Devvit is borked and shows an invalid username.
export function isValidUsername(username: string) {
  const name = username.toLowerCase();
  return (
    name != '[redacted]' &&
    name != '[deleted]' &&
    name != ''
  );
}

// Helper function for when Devvit is borked and shows an invalid user ID.
export function isValidUserId(userId: string) {
  return (userId != 't2_0' && userId != '');
}

// Helper function to create a delay.
// Used for waiting for mod log to update before checking for temporary bans.
function delay(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}