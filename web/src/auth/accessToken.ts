let accessToken = "";

export const getAccessToken = () => accessToken;

export const setAccessToken = (newToken: string) => {
  accessToken = newToken;
};
