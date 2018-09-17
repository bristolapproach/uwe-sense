import * as fs from "tns-core-modules/file-system";

export const SENSOR_SERVICE_ID: string = "a80b";

export const SCAN_DURATION_SECONDS: number = 4;

export const NOTIFY_CHARACTERISTICS = {
    "b4fbc6ce-380f-4ec1-be0a-d163efcf02c4": "UWE-SENSE NO2"
};

export const DEFAULT_RESAMPLE_RATE = {
    hours: 0,
    minutes: 1,
    seconds: 0
};

export function configFolder() {
    const platformModule = require("tns-core-modules/platform");
    return platformModule.isIOS ? fs.knownFolders.ios.sharedPublic() : fs.knownFolders.currentApp();
}
