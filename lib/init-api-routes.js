const path = require('path');
const jsonfile = require("jsonfile")
const nunjucks = require("nunjucks");
nunjucks.configure({ autoescape: true });
const deepExtend = require("deep-extend");
import { get, set, isObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getUniqueId from "./get-unique-id";
import getItemWithId from "./get-item-with-id";
const passport = require('passport');
import { getCollection } from "./db-connection";

export function initApiRoutes ({app, autoGenerateUniqueIds}) {

  app.post('/save', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false});
      return;
    }

    // get existing data
    let user = req.user;
    let existingData = JSON.parse(user.appData);

    // get incoming data
    let incomingData = req.body.data;
    let savePath = req.body.path;
    let saveToId = req.body.saveToId;

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
    let updateResult = await usersCollection.updateOne(
      { "_id" : user._id },
      { $set: { appData: JSON.stringify(existingData) } }
    );

    res.json({success: true});

  })

  app.post('/new', async (req, res) => {
    let templateName = req.body.templateName;
    let partialPath = path.join(__dirname, "../templates/partials/" + templateName + "/index.njk");
    let startingDataPath = path.join(__dirname, "../templates/partials/" + templateName + "/data.json");

    let startingData;
    try {
      startingData = await jsonfile.readFile(startingDataPath);
    } catch (e) {
      startingData = {};
    }

    // add a unique id to every level of the starting data just in case it's needed. it's a little hacky, but it shouldn't cause any problems.
    if (autoGenerateUniqueIds) {
      forEachDeep(startingData, function (value, key, parentValue, context) {
        if (isObject(value) && !value.id) {
          value.id = getUniqueId();
        }
      });
    }

    let htmlString = nunjucks.render(partialPath, startingData);

    res.json({htmlString});
  })

}