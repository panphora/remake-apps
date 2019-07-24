const path = require('path');
const jsonfile = require("jsonfile")
import { nunjucks } from "./nunjucks-lib";
const deepExtend = require("deep-extend");
import { get, set, isObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getItemWithId from "./get-item-with-id";
const passport = require('passport');
import { getCollection } from "./db-connection";
import { appInfo } from "./get-apps-info";


export function initApiRoutes ({app}) {

  app.post('/save', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false});
      return;
    }

    // get incoming data
    let incomingData = req.body.data;
    let savePath = req.body.path;
    let saveToId = req.body.saveToId;
    let appName = req.body.appName;

    // get existing data
    let user = req.user;
    let existingData = JSON.parse(user.appData[appName] || {});

    // option 1: save path
    if (savePath) {
      let dataAtPath = get(existingData, savePath);

      if (isObject(dataAtPath)) {
        // default to extending the data if possible, so no data is lost
        deepExtend(dataAtPath, incomingData);
      } else {
        // if the existing data is an array, number, or string => overwrite it
        set(existingData, savePath, incomingData);
      }
    // option 2: save to id
    } else if (saveToId) {
      let itemData = getItemWithId(existingData, saveToId);
      deepExtend(itemData, incomingData);
    // option 3: extend existing data at root level
    } else {
      if (Array.isArray(existingData)) {
        // overwrite data if it's an array (extending arrays doesn't work)
        existingData = incomingData;
      } else {
        // extend the data if possible, so no data is lost
        deepExtend(existingData, incomingData);
      }
    }

    let usersCollection = await getCollection("users");
    let updateCommand = { $set: { appData: {} } };
    updateCommand["$set"]["appData"][appName] = JSON.stringify(existingData);
    let updateResult = await usersCollection.updateOne(
      { "_id" : user._id },
      updateCommand
    );

    res.json({success: true});

  })

  app.post('/new', async (req, res) => {
    let templateName = req.body.templateName;
    let appName = req.body.appName;

    let matchingPartial = appInfo.partials.find(partial => partial.name === templateName && partial.appName === appName);

    res.json({ htmlString: matchingPartial.renderedHtml });
  })

}





