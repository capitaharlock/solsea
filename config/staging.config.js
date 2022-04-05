module.exports = {
  apps: [
    {
      name: "Solsea-Staging",
      script: "./dist/index.js",
      exec_mode: "fork",
      // exec_mode: "cluster_mode",
      // instances: "max",
      time: true,
      env: {
        PORT: 4001
      }
    }
  ]
};
