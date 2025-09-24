export interface HomeAssistantEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
    icon?: string;
    [key: string]: any;
  };
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface LightEntity extends HomeAssistantEntity {
  attributes: {
    friendly_name?: string;
    brightness?: number;
    color_temp?: number;
    rgb_color?: [number, number, number];
    hs_color?: [number, number];
    effect?: string;
    supported_features: number;
    entity_id?: string[]; // For light groups - contains the entity IDs of grouped lights
    all_lights?: string[]; // Alternative attribute for light groups
  };
}

export interface SwitchEntity extends HomeAssistantEntity {
  attributes: {
    friendly_name?: string;
    icon?: string;
  };
}

export interface SensorEntity extends HomeAssistantEntity {
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
    state_class?: string;
  };
}

export interface MediaPlayerEntity extends HomeAssistantEntity {
  attributes: {
    friendly_name?: string;
    media_title?: string;
    media_artist?: string;
    media_album_name?: string;
    media_content_type?: string;
    media_duration?: number;
    media_position?: number;
    volume_level?: number;
    is_volume_muted?: boolean;
    source?: string;
    source_list?: string[];
    supported_features: number;
  };
}

export interface VacuumEntity extends HomeAssistantEntity {
  attributes: {
    friendly_name?: string;
    battery_level?: number;
    battery_icon?: string;
    fan_speed?: string;
    fan_speed_list?: string[];
    status?: string;
    supported_features: number;
  };
}

export interface HomeAssistantConfig {
  url: string;
  token: string;
  wsUrl: string;
}

export interface Area {
  id: string;
  name: string;
  entities: {
    lights: string[];
    switches: string[];
    sensors: string[];
    mediaPlayers: string[];
    vacuums: string[];
  };
}
