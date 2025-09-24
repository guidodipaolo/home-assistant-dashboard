import axios, { AxiosInstance } from "axios";
import {
  HomeAssistantEntity,
  HomeAssistantConfig,
} from "../types/homeAssistant";

class HomeAssistantAPI {
  private api: AxiosInstance;
  private config: HomeAssistantConfig;

  constructor() {
    this.config = {
      url: process.env.REACT_APP_HA_URL || "",
      token: process.env.REACT_APP_HA_TOKEN || "",
      wsUrl: process.env.REACT_APP_HA_WS_URL || "",
    };

    this.api = axios.create({
      baseURL: `${this.config.url}/api`,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async getStates(): Promise<HomeAssistantEntity[]> {
    try {
      const response = await this.api.get("/states");
      return response.data;
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  }

  async getState(entityId: string): Promise<HomeAssistantEntity> {
    try {
      const response = await this.api.get(`/states/${entityId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching state for ${entityId}:`, error);
      throw error;
    }
  }

  async callService(
    domain: string,
    service: string,
    entityId?: string,
    serviceData?: any
  ): Promise<any> {
    try {
      const data: any = {};
      if (entityId) {
        data.entity_id = entityId;
      }
      if (serviceData) {
        Object.assign(data, serviceData);
      }

      const response = await this.api.post(
        `/services/${domain}/${service}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error calling service ${domain}.${service}:`, error);
      throw error;
    }
  }

  // Light services
  async turnOnLight(
    entityId: string,
    brightness?: number,
    colorTemp?: number,
    rgbColor?: [number, number, number]
  ) {
    const serviceData: any = {};
    if (brightness !== undefined) {
      // Convertir el porcentaje (0-100) al rango de Home Assistant (0-255)
      serviceData.brightness = Math.round((brightness / 100) * 255);
    }
    if (colorTemp !== undefined) serviceData.color_temp = colorTemp;
    if (rgbColor) serviceData.rgb_color = rgbColor;

    return this.callService("light", "turn_on", entityId, serviceData);
  }

  async turnOffLight(entityId: string) {
    return this.callService("light", "turn_off", entityId);
  }

  async setBrightness(entityId: string, brightness: number) {
    // Convertir el porcentaje (0-100) al rango de Home Assistant (0-255)
    const haBrightness = Math.round((brightness / 100) * 255);
    return this.callService("light", "turn_on", entityId, {
      brightness: haBrightness,
    });
  }

  async setColor(entityId: string, rgbColor: [number, number, number]) {
    return this.callService("light", "turn_on", entityId, {
      rgb_color: rgbColor,
    });
  }

  // Switch services
  async turnOnSwitch(entityId: string) {
    return this.callService("switch", "turn_on", entityId);
  }

  async turnOffSwitch(entityId: string) {
    return this.callService("switch", "turn_off", entityId);
  }

  // Media player services
  async turnOnMediaPlayer(entityId: string) {
    return this.callService("media_player", "turn_on", entityId);
  }

  async turnOffMediaPlayer(entityId: string) {
    return this.callService("media_player", "turn_off", entityId);
  }

  async setVolume(entityId: string, volume: number) {
    return this.callService("media_player", "volume_set", entityId, {
      volume_level: volume,
    });
  }

  async playMedia(entityId: string) {
    return this.callService("media_player", "media_play", entityId);
  }

  async pauseMedia(entityId: string) {
    return this.callService("media_player", "media_pause", entityId);
  }

  // Vacuum services
  async startVacuum(entityId: string) {
    return this.callService("vacuum", "start", entityId);
  }

  async pauseVacuum(entityId: string) {
    return this.callService("vacuum", "pause", entityId);
  }

  async returnToBase(entityId: string) {
    return this.callService("vacuum", "return_to_base", entityId);
  }

  async stopVacuum(entityId: string) {
    return this.callService("vacuum", "stop", entityId);
  }

  async setFanSpeed(entityId: string, fanSpeed: string) {
    return this.callService("vacuum", "set_fan_speed", entityId, {
      fan_speed: fanSpeed,
    });
  }

  async locateVacuum(entityId: string) {
    return this.callService("vacuum", "locate", entityId);
  }

  getConfig(): HomeAssistantConfig {
    return this.config;
  }
}

export const homeAssistantAPI = new HomeAssistantAPI();
