import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
try {
  const app = initializeApp({ apiKey: undefined, appId: undefined, measurementId: undefined, projectId: undefined });
  const analytics = getAnalytics(app);
  console.log("Success");
} catch (e) {
  console.error("Error:", e.message);
}
