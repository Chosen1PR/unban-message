import express from "express";
import {
  createServer,
  getServerPort,
  reddit,
  settings
} from "@devvit/web/server";

import {
  isModIgnored,
  sendMessageToUser,
  wasBanTemporary,
  getRequestBodyValue
} from "./utils.js";

import { UserId } from "./types.js"

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

// Menu item for app settings
// Likely not necessary
/*
router.post("/internal/menu/app-settings", async (_req, res): Promise<void> => {
  res.json({
    navigateTo: `https://developers.reddit.com/r/${context.subredditName}/apps/${context.appSlug}`,
  });
});
*/

// Trigger handler for mod action, specifically unban
router.post('/internal/triggers/on-mod-action', async (req, res): Promise<void> => {
  const action = getRequestBodyValue(req.body, ['action']) ?? '';
  try {
    if (action === "unbanuser") {
      // If we're here, this is an unban action.
      const modUsername = getRequestBodyValue(req.body, ['moderator', 'name']) ?? '',
      userId = getRequestBodyValue(req.body, ['targetUser', 'id']) ?? '';
      if (userId == '' || userId == 't2_0') return;
      const allSettings = await settings.getAll();
      const appEnabled = allSettings["enable-message"] as boolean;
      if (!appEnabled) return; // If app is disabled, do nothing.
      const modWhitelist = allSettings["mod-whitelist"] as string;
      const modBlacklist = allSettings["mod-blacklist"] as string;
      const modIgnored = isModIgnored(modUsername, modWhitelist, modBlacklist);
      if (modIgnored) return; // If mod is ignored, do nothing.
      const ignoreTempBans = allSettings["ignore-temp-bans"] as boolean ?? false;
      const user = await reddit.getUserById(userId as UserId);
      if (!user) return;
      if (ignoreTempBans) {
        if (await wasBanTemporary(user.username)) return; // If ban was temporary and we're ignoring those, do nothing.
      }
      // Else, send message to user.
      const messageText = allSettings["message-text"] as string ?? '';
      const sendAsSubreddit = allSettings["send-as-subreddit"] as boolean;
      await sendMessageToUser(user.username, messageText, sendAsSubreddit);
    }
    res.status(200).json({ status: 'ok' });
  }
  catch (error) {
    console.log(`General error: ${error}`);
  }
});

app.use(router);

const server = createServer(app);
server.on("error", (err) => console.error(`server error: ${err.stack}`));
server.listen(getServerPort());