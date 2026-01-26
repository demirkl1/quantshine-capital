import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "quantshine-realm",
    clientId: "quantshine-backend",
});

export default keycloak;