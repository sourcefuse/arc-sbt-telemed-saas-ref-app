export interface AppConfiguration {
  clientId: string;
  authApiBaseUrl: string;
  notificationApiBaseUrl: string;
  videoApiBaseUrl: string;
  pubnubPublishKey: string;
  pubnubSubscribeKey: string;
  notificationChannelUuid: string;
  chatChannelUuid: string;
  vonageApiKey: string;
  loginTitle: string;
}

const useConfig = (): {
  config: AppConfiguration;
} => {
  return {
    config: {
      authApiBaseUrl: import.meta.env.VITE_AUTH_API_BASE_URL,
      clientId: import.meta.env.VITE_CLIENT_ID,
      notificationApiBaseUrl: import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
      videoApiBaseUrl: import.meta.env.VITE_VIDEO_API_BASE_URL,
      pubnubPublishKey: import.meta.env.VITE_PUBNUB_PUBLISH_KEY,
      pubnubSubscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
      notificationChannelUuid: import.meta.env.VITE_NOTIFICATION_CHANNEL_UUID,
      chatChannelUuid: import.meta.env.VITE_CHAT_CHANNEL_UUID,
      vonageApiKey: import.meta.env.VITE_VONAGE_API_KEY,
      loginTitle: import.meta.env.VITE_LOGIN_TITLE,
    },
  };
};

export default useConfig;
