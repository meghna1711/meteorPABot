
ServiceConfiguration.configurations.upsert(
    { service: "google" },
    {
      $set: {
        clientId: "309157398717-8no7vhadttoahu67p7qijkfvg7hq3m4c.apps.googleusercontent.com",
        loginStyle: "popup",
        secret: "oeykpiw3OSF6dmDoS2VDN9p2"
      }
    }
);


ServiceConfiguration.configurations.upsert(
    { service: "github" },
    {
        $set: {
            clientId: "0edba71a1b3f4efb6a54",
            loginStyle: "popup",
            secret: "82a06bb18d01ecaaea848def44388b00bc154010"
        }
    }
);

//Cloudinary configuration

Cloudinary.config({
    cloud_name : "meghna1711",
    api_key : "398219457986465",
    api_secret : "RYJn4JbMOhM6OpP8TbiF_f2Ua0k"
});