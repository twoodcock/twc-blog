/*
 * Config.js
 *
 * Provide configuration to access the API endpoint.
 */

 const config = {
    "development": {
        apiEndpoint: "http://albatross.lxd:3000/"
    },
    "production": {
        apiEndpoint: "/r/"
    },
    "test": {
        apiEndpoint: "/r/"
    }
 }

 export default config;