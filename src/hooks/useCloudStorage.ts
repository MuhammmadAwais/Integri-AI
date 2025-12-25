
import { useState } from "react";

// --- Configuration ---
// PRO TIP: Move these to your .env file
const GOOGLE_API_KEY = "AIzaSyC8LdEHdE3MA13dO1brtm2UbOIo01QqlDY";
const GOOGLE_CLIENT_ID =
  "1099368769804-miohir1ka8q3vdegp9t2vgrnafigocb1.apps.googleusercontent.com";
const GOOGLE_APP_ID = "1099368769804"; // Found in Google Console Dashboard// Found in Google Console Dashboard

const ONEDRIVE_CLIENT_ID = "YOUR_ONEDRIVE_CLIENT_ID";

export const useCloudStorage = (onFileSelected: (file: File) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  // ==============================
  // 1. GOOGLE DRIVE INTEGRATION (GIS + GAPI)
  // ==============================

  // Load GAPI (Google API Client) - Needed for the Picker
  const loadGapi = () => {
    return new Promise((resolve) => {
      if ((window as any).gapi) {
        resolve((window as any).gapi);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => resolve((window as any).gapi);
      document.body.appendChild(script);
    });
  };

  // Load GIS (Google Identity Services) - Needed for Auth (Fixes your error)
  const loadGis = () => {
    return new Promise((resolve) => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve((window as any).google.accounts.oauth2);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => resolve((window as any).google.accounts.oauth2);
      document.body.appendChild(script);
    });
  };

  const handleGoogleDrivePick = async () => {
    setIsLoading(true);
    try {
      // 1. Load scripts in parallel
      const [gapi, googleIdentity] = (await Promise.all([
        loadGapi(),
        loadGis(),
      ])) as [any, any];

      // 2. Load the 'picker' module in gapi
      await new Promise<void>((resolve) => gapi.load("picker", resolve));

      // 3. Request Access Token using the NEW Token Client (GIS)
      const tokenClient = googleIdentity.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: async (response: any) => {
          if (response.error !== undefined) {
            throw response;
          }

          const accessToken = response.access_token;

          // 4. Create the Picker
          const view = new google.picker.View(google.picker.ViewId.DOCS);
          view.setMimeTypes(
            "application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );

          const picker = new google.picker.PickerBuilder()
            .setDeveloperKey(GOOGLE_API_KEY)
            .setAppId(GOOGLE_APP_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView()) // Optional: Allow uploading specifically to Drive then picking
            .setCallback(async (data: any) => {
              if (data.action === google.picker.Action.PICKED) {
                const fileId = data.docs[0].id;
                const fileName = data.docs[0].name;
                const mimeType = data.docs[0].mimeType;

                // Fetch actual file content using the token we just got
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
                  console.error("Failed to download file content", e);
                }
              }
              setIsLoading(false);
            })
            .build();

          picker.setVisible(true);
        },
      });

      // Trigger the auth flow
      // prompt: '' implies we try to silence prompts if possible, but for first time it will pop up
      tokenClient.requestAccessToken({ prompt: "" });
    } catch (err) {
      console.error("Google Drive Error:", err);
      alert("Failed to connect to Google Drive");
      setIsLoading(false);
    }
  };

  // ==============================
  // 2. ONEDRIVE INTEGRATION (Unchanged)
  // ==============================
  const handleOneDrivePick = () => {
    setIsLoading(true);
    const script = document.createElement("script");
    script.src = "https://js.live.net/v7.2/OneDrive.js";
    script.onload = () => {
      const odOptions = {
        clientId: ONEDRIVE_CLIENT_ID,
        action: "download",
        multiSelect: false,
        advanced: { filter: "folder,.pdf,.docx,.txt" },
        success: async (files: any) => {
          const downloadUrl = files.value[0]["@microsoft.graph.downloadUrl"];
          const fileName = files.value[0].name;
          try {
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: blob.type });
            onFileSelected(file);
          } catch (e) {
            console.error("OneDrive Download Error", e);
          }
          setIsLoading(false);
        },
        cancel: () => {
          setIsLoading(false);
        },
        error: (e: any) => {
          console.error("OneDrive Picker Error", e);
          setIsLoading(false);
        },
      };
      (window as any).OneDrive.open(odOptions);
    };
    document.body.appendChild(script);
  };

  return {
    handleGoogleDrivePick,
    handleOneDrivePick,
    isLoading,
  };
};