import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8081",
  realm: "partner-management",
  clientId: "react-app",
});

export default keycloak;