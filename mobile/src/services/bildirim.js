import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as api from "../api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let kayitCB = null;

export function bildirimYanitiniDinle(callback) {
  kayitCB = callback;
  const abonelik = Notifications.addNotificationResponseReceivedListener(
    (yanit) => {
      if (callback) {
        callback(yanit.notification.request.content.data || {});
      }
    }
  );
  Notifications.getLastNotificationResponseAsync()
    .then((son) => {
      if (son && callback) {
        callback(son.notification.request.content.data || {});
      }
    })
    .catch(() => {});
  return abonelik;
}

export async function expoTokenAl() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("genel", {
      name: "Genel bildirimler",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2f6149",
    });
  }

  const mevcut = await Notifications.getPermissionsAsync();
  let izin = mevcut.status;
  if (izin !== "granted") {
    const istek = await Notifications.requestPermissionsAsync();
    izin = istek.status;
  }
  if (izin !== "granted") {
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    return null;
  }
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function bildirimKaydet(token) {
  if (!token) return null;
  try {
    await api.cihazKaydet({ expo_token: token, platform: Platform.OS });
    return token;
  } catch {
    return null;
  }
}

export async function pushTokenKaydet() {
  try {
    const pushToken = await expoTokenAl();
    if (!pushToken) return null;
    return await bildirimKaydet(pushToken);
  } catch {
    return null;
  }
}

export async function bildirimKaldir(token) {
  if (!token) return null;
  try {
    await api.cihazKaldir({ expo_token: token });
    return true;
  } catch {
    return null;
  }
}

export { Notifications };