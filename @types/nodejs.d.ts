declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "production" | "development";
    BROWSER: "chrome" | "firefox";
  }
}
