
import { useState} from "react";
// --- Configuration ---

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_APP_ID;
const ONEDRIVE_CLIENT_ID = import.meta.env.VITE_ONEDRIVE_CLIENT_ID;
declare const google: any;
export const useCloudStorage = (onFileSelected: (file: File) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  // ========================================================================
  // 1. GOOGLE DRIVE INTEGRATION (GIS + GAPI)
  // ========================================================================
  const loadGapi = () => {
    return new Promise((resolve) => {
      if ((window as any).gapi) return resolve((window as any).gapi);
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => resolve((window as any).gapi);
      document.body.appendChild(script);
    });
  };

  const loadGis = () => {
    return new Promise((resolve) => {
      if ((window as any).google?.accounts?.oauth2)
        return resolve((window as any).google.accounts.oauth2);
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => resolve((window as any).google.accounts.oauth2);
      document.body.appendChild(script);
    });
  };

  const handleGoogleDrivePick = async () => {
    setIsLoading(true);
    try {
      const [gapi, googleIdentity] = (await Promise.all([
        loadGapi(),
        loadGis(),
      ])) as [any, any];
      await new Promise<void>((resolve) => gapi.load("picker", resolve));

      const tokenClient = googleIdentity.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: async (response: any) => {
          if (response.error) throw response;
          const accessToken = response.access_token;

          const view = new google.picker.View(google.picker.ViewId.DOCS);
          view.setMimeTypes(
            "application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );

          const picker = new google.picker.PickerBuilder()
            .setDeveloperKey(GOOGLE_API_KEY)
            .setAppId(GOOGLE_APP_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback(async (data: any) => {
              if (data.action === google.picker.Action.PICKED) {
                const fileId = data.docs[0].id;
                const fileName = data.docs[0].name;
                const mimeType = data.docs[0].mimeType;
                try {
                  const res = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                    {
                      headers: { Authorization: `Bearer ${accessToken}` },
                    }
                  );
                  const blob = await res.blob();
                  const file = new File([blob], fileName, { type: mimeType });
                  onFileSelected(file);
                } catch (e) {
                  console.error("GDrive Download Error", e);
                }
              }
              setIsLoading(false);
            })
            .build();
          picker.setVisible(true);
        },
      });
      tokenClient.requestAccessToken({ prompt: "" });
    } catch (err) {
      console.error("Google Drive Error:", err);
      alert("Failed to connect to Google Drive");
      setIsLoading(false);
    }
  };

  // ========================================================================
  // 2. ONEDRIVE INTEGRATION (File Picker v8 + MSAL)
  // ========================================================================
  const loadMsal = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).msal) return resolve((window as any).msal);
      const script = document.createElement("script");
      script.src =
        "https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js";
      script.async = true;
      script.onload = () => resolve((window as any).msal);
      script.onerror = () => reject("Failed to load MSAL");
      document.body.appendChild(script);
    });
  };

  const handleOneDrivePick = async () => {
    setIsLoading(true);
    try {
      const msal: any = await loadMsal();

      const msalConfig = {
        auth: {
          clientId: ONEDRIVE_CLIENT_ID,
          authority: "https://login.microsoftonline.com/consumers", // 'consumers' fixes the Tenant error for personal accounts
          redirectUri: window.location.origin,
        },
        cache: { cacheLocation: "sessionStorage" },
      };

      const msalInstance = new msal.PublicClientApplication(msalConfig);
      await msalInstance.initialize();

      // 1. Get Access Token
      let accessToken;
      try {
        const loginResponse = await msalInstance.loginPopup({
          scopes: ["Files.Read", "Files.Read.All"],
        });
        accessToken = loginResponse.accessToken;
      } catch (loginErr) {
        console.error("OneDrive Login Failed", loginErr);
        setIsLoading(false);
        return;
      }

      // 2. Launch v8 Picker
      // We open a popup to the OneDrive Picker endpoint and POST the token to it
      const pickerEndpoint = "https://onedrive.live.com/picker";

      // Configuration for the picker
      const pickerOptions = {
        sdk: "8.0",
        entry: {
          oneDrive: {
            files: {}, // Start in files
          },
        },
        authentication: {}, // Token is passed via form
        messaging: {
          origin: window.location.origin,
          channelId: "27", // Arbitrary ID to verify messages
        },
        selection: {
          mode: "single", // Or 'multiple'
        },
        typesAndSources: {
          mode: "files",
          pivots: {
            oneDrive: true,
            recent: true,
          },
        },
      };

      // Open the popup window
      const win = window.open("", "Picker", "width=1080,height=650");
      if (!win) {
        alert("Pop-up blocked. Please allow pop-ups for this site.");
        setIsLoading(false);
        return;
      }

      // Create a form to POST authentication to the picker URL
      const form = win.document.createElement("form");
      form.setAttribute("action", pickerEndpoint);
      form.setAttribute("method", "POST");
      win.document.body.append(form);

      const inputToken = win.document.createElement("input");
      inputToken.setAttribute("type", "hidden");
      inputToken.setAttribute("name", "access_token");
      inputToken.setAttribute("value", accessToken);
      form.appendChild(inputToken);

      const inputState = win.document.createElement("input");
      inputState.setAttribute("type", "hidden");
      inputState.setAttribute("name", "filePicker");
      inputState.setAttribute("value", JSON.stringify(pickerOptions));
      form.appendChild(inputState);

      // Submit the form to navigate the popup to the picker
      form.submit();

      // 3. Listen for the file selection message
      const messageListener = async (event: MessageEvent) => {
        if (event.source !== win) return;

        const message = event.data;

        // Handshake / Activation
        if (message.type === "initialize" && message.channelId === "27") {
          const port = event.ports[0];

          port.onmessage = async (mEvent) => {
            const data = mEvent.data;

            // Handle the 'pick' command (User selected a file)
            if (data.type === "command" && data.data.command === "pick") {
              const pickedItems = data.data.items; // Array of items
              if (pickedItems && pickedItems.length > 0) {
                const item = pickedItems[0];

                // We need to fetch the file content.
                // The picker returns metadata. Use the Graph API or the provided download URL.
                // v8 for consumers usually provides valid download info, but sometimes we need a second call.
                try {
                  // Prefer the @microsoft.graph.downloadUrl if available, else fetch via ID
                  let downloadUrl = item["@microsoft.graph.downloadUrl"];

                  if (!downloadUrl && item.id) {
                    // Fallback: Fetch metadata from Graph to get download URL
                    const graphRes = await fetch(
                      `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}`,
                      {
                        headers: { Authorization: `Bearer ${accessToken}` },
                      }
                    );
                    const graphJson = await graphRes.json();
                    downloadUrl = graphJson["@microsoft.graph.downloadUrl"];
                  }

                  if (downloadUrl) {
                    const res = await fetch(downloadUrl);
                    const blob = await res.blob();
                    const file = new File([blob], item.name, {
                      type: blob.type || "application/pdf",
                    });
                    onFileSelected(file);
                  } else {
                    console.error("Could not find download URL for item", item);
                  }
                } catch (err) {
                  console.error("Failed to download file", err);
                }
              }
              port.postMessage({
                type: "result",
                id: data.id,
                data: { result: "success" },
              });
              win.close();
              setIsLoading(false);
            }

            // Handle Close/Cancel
            if (data.type === "command" && data.data.command === "close") {
              win.close();
              setIsLoading(false);
            }
          };

          // Activate the port
          port.start();
          port.postMessage({ type: "activate" });
        }
      };

      window.addEventListener("message", messageListener);

      // Cleanup listener when window closes
      const timer = setInterval(() => {
        if (win.closed) {
          clearInterval(timer);
          window.removeEventListener("message", messageListener);
          setIsLoading(false);
        }
      }, 1000);
    } catch (err) {
      console.error("OneDrive v8 Error", err);
      alert("Failed to launch OneDrive Picker");
      setIsLoading(false);
    }
  };

  return {
    handleGoogleDrivePick,
    handleOneDrivePick,
    isLoading,
  };
};