import { set, isObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getUniqueId from "./get-unique-id";
import { getCollection } from "./db-connection";

export async function preProcessData ({data, user, params, appName}) {
  let someUniqueIdsAdded = false;
  let currentItem;

  forEachDeep(data, function (value, key, parentValue, context) {

    if (isObject(value)) {

      // generate unique ids for every object item
      if (!value.id) {
        value.id = getUniqueId();
        someUniqueIdsAdded = true;
      }

      // get the data for the id in the route param if there is one
      if (params.id && value.id === params.id) {
        currentItem = value;
      }

    }

  });

  // save the data if some new ids have been added to it
  if (someUniqueIdsAdded) {
    let usersCollection = await getCollection("users");
    let updateCommand = {$set: {}};
    updateCommand["$set"][`appData.${appName}`] = JSON.stringify(data);

    let updateResult = await usersCollection.updateOne(
      { "_id" : user._id },
      updateCommand
    );
  }

  return { currentItem };
}


