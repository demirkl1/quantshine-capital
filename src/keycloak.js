import Keycloak from "keycloak-js";

const getEnvVar = (key, devDefault) => {
    const value = process.env[key];
    if (!value) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                `[Keycloak] Zorunlu ortam değişkeni eksik: ${key}. ` +
                `Production ortamında .env dosyasını kontrol edin.`
            );
        }
        return devDefault;
    }
    return value;
};

const keycloak = new Keycloak({
    url:      getEnvVar('REACT_APP_KEYCLOAK_URL',       'http://localhost:9090'),
    realm:    getEnvVar('REACT_APP_KEYCLOAK_REALM',     'quantshine'),
    clientId: getEnvVar('REACT_APP_KEYCLOAK_CLIENT_ID', 'quantshine-backend'),
});

export const updateToken = (successCallback) => {
    keycloak.updateToken(70)
        .then((refreshed) => {
            if (refreshed) {
                localStorage.setItem('token', keycloak.token);
                if (successCallback) successCallback();
            }
        })
        .catch(() => {
            keycloak.clearToken();
        });
};

export default keycloak;
