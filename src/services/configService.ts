import { Config, Message, Guide, Asset } from "../types";

class ConfigService {
  private static instance: ConfigService;
  private config: Config | null = null;
  private baseUrl: string;

  private constructor() {
    // Determine the API base URL. In development, use the local API server.
    // In production, prefer the VITE_API_URL environment variable and fall
    // back to the current origin if not provided.
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') {
        this.baseUrl = 'http://localhost:3001';
      } else {
        this.baseUrl = (import.meta as any).env.VITE_API_URL || window.location.origin;
      }
    } else {
      this.baseUrl = '';
    }
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async loadConfig(): Promise<Config> {
    try {
      // Load from static config.json file
      const staticResponse = await fetch("/config.json");
      if (!staticResponse.ok) {
        throw new Error(`Failed to load config: ${staticResponse.statusText}`);
      }
      const config = await staticResponse.json();
      this.config = config;
      console.log('📁 Loaded config from static file');
      return config;
    } catch (error) {
      console.error("Error loading config:", error);
      throw error;
    }
  }

  async updateMessage(messageId: string, updatedMessage: Message): Promise<Config> {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMessage),
      });

      if (!response.ok) {
        throw new Error(`Failed to update message: ${response.statusText}`);
      }

      const updatedConfig = await response.json();
      this.config = updatedConfig;
      
      // Show success notification
      this.showSaveNotification();
      
      return updatedConfig;
    } catch (error) {
      console.error("Error updating message:", error);
      throw error;
    }
  }

  async updateGuide(guideId: string, updatedGuide: Guide): Promise<Config> {
    try {
      const response = await fetch(`${this.baseUrl}/api/guides/${guideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGuide),
      });

      if (!response.ok) {
        throw new Error(`Failed to update guide: ${response.statusText}`);
      }

      const updatedConfig = await response.json();
      this.config = updatedConfig;
      
      this.showSaveNotification();
      
      return updatedConfig;
    } catch (error) {
      console.error("Error updating guide:", error);
      throw error;
    }
  }

  async updateAsset(assetId: string, updatedAsset: Asset): Promise<Config> {
    try {
      // Get current config and update the asset
      if (!this.config) {
        await this.loadConfig();
      }

      const assetIndex = this.config!.assets.findIndex((a: Asset) => a.id === assetId);
      if (assetIndex === -1) {
        throw new Error("Asset not found");
      }

      this.config!.assets[assetIndex] = updatedAsset;

      // Save entire config to API
      const response = await fetch(`${this.baseUrl}/api/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      });

      if (!response.ok) {
        throw new Error(`Failed to update asset: ${response.statusText}`);
      }

      const updatedConfig = await response.json();
      this.config = updatedConfig;
      
      this.showSaveNotification();
      
      return updatedConfig;
    } catch (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  }

  async loadMessageConfig(language: string): Promise<Message[]> {
    try {
      // Load from static config for built-in locales
      const response = await fetch(`/locales/config_${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load message config: ${response.statusText}`);
      }
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error("Error loading message config:", error);
      throw error;
    }
  }

  private showSaveNotification(): void {
    // Create a notification element
    const notification = document.createElement("div");
    notification.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm";
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <p class="font-medium">Changes Saved Successfully!</p>
          <p class="text-sm opacity-90">Updates are now live for all users</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  downloadUpdatedConfig(): void {
    if (!this.config) {
      alert("No config loaded to download");
      return;
    }

    const configJson = JSON.stringify(this.config, null, 2);
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  hasPendingChanges(): boolean {
    // With Redis, changes are immediately persisted
    return false;
  }

  getConfig(): Config | null {
    return this.config;
  }
}

export default ConfigService; 