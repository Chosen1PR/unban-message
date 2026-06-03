import express from "express";
import {
  createServer,
  //context,
  getServerPort,
  settings,
  //reddit
} from "@devvit/web/server";

import { isModIgnored, sendMessageToUser, wasBanTemporary } from "./utils.js";

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
  try {
    const type = req.body.type as string;
    if (type != undefined && type === "ModAction") {
      //console.log(req.body.toString());
      const action = req.body.action as string;
      if (action != undefined && action === "unbanuser") {
        // If we're here, this is an unban action.
        const allSettings = await settings.getAll();
        const appEnabled = allSettings["enable-message"] as boolean;
        if (!appEnabled) return; // If app is disabled, do nothing.
        const modUsername = req.body.moderator.name as string;
        const modWhitelist = allSettings["mod-whitelist"] as string;
        const modBlacklist = allSettings["mod-blacklist"] as string;
        const modIgnored = isModIgnored(modUsername, modWhitelist, modBlacklist);
        if (modIgnored) return; // If mod is ignored, do nothing.
        const username = req.body.targetUser.name as string;
        const ignoreTempBans = allSettings["ignore-temp-bans"] as boolean ?? false;
        if (ignoreTempBans) {
          if (await wasBanTemporary(username)) return; // If ban was temporary and we're ignoring those, do nothing.
        }
        // Else, send message to user.
        const messageText = allSettings["message-text"] as string ?? '';
        const sendAsSubreddit = allSettings["send-as-subreddit"] as boolean;
        await sendMessageToUser(username, messageText, sendAsSubreddit);
      }
    }
    res.status(200).json({ status: 'ok' });
  }
  catch {} // General catch to make sure app doesn't throw an exception.
});

app.use(router);

const server = createServer(app);
server.on("error", (err) => console.error(`server error: ${err.stack}`));
server.listen(getServerPort());