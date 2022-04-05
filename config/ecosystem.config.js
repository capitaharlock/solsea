module.exports = {
  apps: [
    {
      name: "Solsea",
      script: "./dist/index.js",
      // exec_mode: "fork",
      exec_mode: "cluster_mode",
      instances: "4",
      time: true,
      max_memory_restart: "1G",
      env: {
        PORT: 4000
      }
    }
  ]
};
