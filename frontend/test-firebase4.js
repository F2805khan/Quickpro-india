import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
try {
  const app = initializeApp({ apiKey: undefined, appId: undefined, measurementId: undefined, projectId: undefined });
  const auth = getAuth(app);
  console.log("Success Auth");
} catch (e) {
  console.error("Error Auth:", e.message);
}
