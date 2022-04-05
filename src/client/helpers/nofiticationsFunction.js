import { store } from "react-notifications-component";
import { notificationOptions } from "../../api/Definitions";

export function errorNotification(e) {
  if (e) {
    if (e.message === "Nothing changed!") {
      store.addNotification({
        message: e.message,
        type: "warning",
        ...notificationOptions
      });
    } else {
      store.addNotification({
        message: e.message,
        type: "danger",
        ...notificationOptions
      });
    }
  } else {
    store.addNotification({
      message: "Something went wrong!",
      type: "danger",
      ...notificationOptions
    });
  }
}
