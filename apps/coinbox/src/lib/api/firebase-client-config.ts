/**
 * Firebase Client Configuration
 * Exports functions instance for Cloud Functions calls
 */

import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { app } from "@/config/firebase";

export const functions = getFunctions(app);

// Connect to emulator in development
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001);
  console.log("Connected to Firebase Functions Emulator");
}
