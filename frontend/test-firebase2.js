import { initializeApp } from "firebase/app";
try {
  initializeApp({ apiKey: undefined });
  console.log("Success with undefined apiKey");
} catch (e) {
  console.error("Error with undefined apiKey:", e.message);
}

try {
  initializeApp({ });
  console.log("Success with empty config");
} catch (e) {
  console.error("Error with empty config:", e.message);
}
