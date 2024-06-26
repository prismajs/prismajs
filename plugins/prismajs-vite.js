import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import path from "path";
import colors from "picocolors";
import { loadEnv } from "vite";
import fullReload from "vite-plugin-full-reload";

let exitHandlersBound = false; // Declare the variable at the top

const refreshPaths = [
  "app/View/Components/**",
  "resources/views/**",
  "resources/lang/**",
  "lang/**",
  "routes/**"
];

function prismajs(config) {
  const pluginConfig = resolvePluginConfig(config);
  return [
    resolvePrismajsPlugin(pluginConfig),
    ...resolveFullReloadConfig(pluginConfig)
  ];
}

function resolvePrismajsPlugin(pluginConfig) {
  let viteDevServerUrl;
  let resolvedConfig;
  let userConfig;

  const defaultAliases = {
    "@": "/resources/js"
  };

  return {
    name: "prismajs",
    enforce: "post",
    config: (config, { command, mode }) => {
      userConfig = config;
      const ssr = !!userConfig.build?.ssr;
      const env = loadEnv(mode, userConfig.envDir || process.cwd(), "");
      const assetUrl = env.ASSET_URL ?? "";
      const serverConfig = command === "serve" ? resolveDevelopmentEnvironmentServerConfig(pluginConfig.detectTls) ?? resolveEnvironmentServerConfig(env) : void 0;
      ensureCommandShouldRunInEnvironment(command, env);
      return {
        base: userConfig.base ?? (command === "build" ? resolveBase(pluginConfig, assetUrl) : ""),
        publicDir: userConfig.publicDir ?? false,
        build: {
          manifest: userConfig.build?.manifest ?? !ssr,
          outDir: userConfig.build?.outDir ?? resolveOutDir(pluginConfig, ssr),
          rollupOptions: {
            input: userConfig.build?.rollupOptions?.input ?? resolveInput(pluginConfig, ssr)
          },
          assetsInlineLimit: userConfig.build?.assetsInlineLimit ?? 0
        },
        server: {
          origin: userConfig.server?.origin ?? "__prismajs_vite_placeholder__",
          ...process.env.PRISMAJS_SAIL ? {
            host: userConfig.server?.host ?? "0.0.0.0",
            port: userConfig.server?.port ?? (env.VITE_PORT ? parseInt(env.VITE_PORT) : 5173),
            strictPort: userConfig.server?.strictPort ?? true
          } : void 0,
          ...serverConfig ? {
            host: userConfig.server?.host ?? serverConfig.host,
            hmr: userConfig.server?.hmr === false ? false : {
              ...serverConfig.hmr,
              ...userConfig.server?.hmr === true ? {} : userConfig.server?.hmr
            },
            https: userConfig.server?.https === false ? false : {
              ...serverConfig.https,
              ...userConfig.server?.https === true ? {} : userConfig.server?.https
            }
          } : void 0
        },
        resolve: {
          alias: Array.isArray(userConfig.resolve?.alias) ? [
            ...userConfig.resolve?.alias ?? [],
            ...Object.keys(defaultAliases).map((alias) => ({
              find: alias,
              replacement: defaultAliases[alias]
            }))
          ] : {
            ...defaultAliases,
            ...userConfig.resolve?.alias
          }
        },
        ssr: {
          noExternal: noExternalInertiaHelpers(userConfig)
        }
      };
    },
    configResolved(config) {
      resolvedConfig = config;
    },
    transform(code) {
      if (resolvedConfig.command === "serve") {
        code = code.replace(/__prismajs_vite_placeholder__/g, viteDevServerUrl);
        return pluginConfig.transformOnServe(code, viteDevServerUrl);
      }
    },
    configureServer(server) {
      const envDir = resolvedConfig.envDir || process.cwd();
      const appUrl = loadEnv(resolvedConfig.mode, envDir, "APP_URL").APP_URL ?? "undefined";
      server.httpServer?.once("listening", () => {
        const address = server.httpServer?.address();
        const isAddressInfo = (x) => typeof x === "object";
        if (isAddressInfo(address)) {
          viteDevServerUrl = resolveDevServerUrl(address, server.config, userConfig);
          fs.writeFileSync(pluginConfig.hotFile, viteDevServerUrl);
          setTimeout(() => {
            server.config.logger.info(`
  ${colors.red(`${colors.bold("PRISMAJS")}`)}  ${colors.dim("plugin")} ${colors.bold(`v${pluginVersion()}`)}`);
            server.config.logger.info("");
            server.config.logger.info(`  ${colors.green("\u279C")}  ${colors.bold("APP_URL")}: ${colors.cyan(appUrl.replace(/:(\d+)/, (_, port) => `:${colors.bold(port)}`))}`);
          }, 100);
        }
      });
      if (!exitHandlersBound) {
        const clean = () => {
          if (fs.existsSync(pluginConfig.hotFile)) {
            fs.rmSync(pluginConfig.hotFile);
          }
        };
        process.on("exit", clean);
        process.on("SIGINT", () => {
          process.exitCode = 0; // Set exit code to 0 for SIGINT
          clean();
          process.exit();
        });
        process.on("SIGTERM", () => {
          process.exitCode = 0; // Set exit code to 0 for SIGTERM
          clean();
          process.exit();
        });
        process.on("SIGHUP", () => {
          process.exitCode = 0; // Set exit code to 0 for SIGHUP
          clean();
          process.exit();
        });
        exitHandlersBound = true;
      }
      return () => server.middlewares.use((req, res, next) => {
        if (req.url === "/index.html") {
          res.statusCode = 404;
          res.end(
            fs.readFileSync(path.join(dirname(), "dev-server-index.html")).toString().replace(/{{ APP_URL }}/g, appUrl)
          );
        }
        next();
      });
    }
  };
}

function ensureCommandShouldRunInEnvironment(command, env) {
  if (command === "build" || env.PRISMAJS_BYPASS_ENV_CHECK === "1") {
    return;
  }
  if (typeof env.PRISMAJS_VAPOR !== "undefined") {
    throw Error("You should not run the Vite HMR server on Vapor. You should build your assets for production instead. To disable this ENV check you may set PRISMAJS_BYPASS_ENV_CHECK=1");
  }
  if (typeof env.PRISMAJS_FORGE !== "undefined") {
    throw Error("You should not run the Vite HMR server in your Forge deployment script. You should build your assets for production instead. To disable this ENV check you may set PRISMAJS_BYPASS_ENV_CHECK=1");
  }
  if (typeof env.PRISMAJS_ENVOYER !== "undefined") {
    throw Error("You should not run the Vite HMR server in your Envoyer hook. You should build your assets for production instead. To disable this ENV check you may set PRISMAJS_BYPASS_ENV_CHECK=1");
  }
  if (typeof env.CI !== "undefined") {
    throw Error("You should not run the Vite HMR server in CI environments. You should build your assets for production instead. To disable this ENV check you may set PRISMAJS_BYPASS_ENV_CHECK=1");
  }
}

function pluginVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(dirname(), "../package.json")).toString())?.version;
  } catch {
    return "";
  }
}

function resolvePluginConfig(config) {
  if (typeof config === "undefined") {
    throw new Error("prismajs-vite-plugin: missing configuration.");
  }
  if (typeof config === "string" || Array.isArray(config)) {
    config = { input: config, ssr: config };
  }
  if (typeof config.input === "undefined") {
    throw new Error('prismajs-vite-plugin: missing configuration for "input".');
  }
  if (typeof config.publicDirectory === "string") {
    config.publicDirectory = config.publicDirectory.trim().replace(/^\/+/, "");
    if (config.publicDirectory === "") {
      throw new Error("prismajs-vite-plugin: publicDirectory must be a subdirectory. E.g. 'public'.");
    }
  }
  if (typeof config.buildDirectory === "string") {
    config.buildDirectory = config.buildDirectory.trim().replace(/^\/+/, "").replace(/\/+$/, "");
    if (config.buildDirectory === "") {
      throw new Error("prismajs-vite-plugin: buildDirectory must be a subdirectory. E.g. 'build'.");
    }
  }
  if (typeof config.ssrOutputDirectory === "string") {
    config.ssrOutputDirectory = config.ssrOutputDirectory.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  }
  if (config.refresh === true) {
    config.refresh = [{ paths: refreshPaths }];
  }
  return {
    input: config.input,
    publicDirectory: config.publicDirectory ?? "public",
    buildDirectory: config.buildDirectory ?? "build",
    ssr: config.ssr ?? config.input,
    ssrOutputDirectory: config.ssrOutputDirectory ?? "bootstrap/ssr",
    refresh: config.refresh ?? false,
    hotFile: config.hotFile ?? path.join(config.publicDirectory ?? "public", "hot"),
    valetTls: config.valetTls ?? false,
    detectTls: config.detectTls ?? config.valetTls ?? false,
    transformOnServe: config.transformOnServe ?? ((code) => code)
  };
}

function resolveBase(config, assetUrl) {
  return assetUrl + (!assetUrl.endsWith("/") ? "/" : "") + config.buildDirectory + "/";
}

function resolveInput(config, ssr) {
  if (ssr) {
    return config.ssr;
  }
  return config.input;
}

function resolveOutDir(config, ssr) {
  if (ssr) {
    return config.ssrOutputDirectory;
  }
  return path.join(config.publicDirectory, config.buildDirectory);
}

function resolveFullReloadConfig({ refresh: config }) {
  if (typeof config === "boolean") {
    return [];
  }
  if (typeof config === "string") {
    config = [{ paths: [config] }];
  }
  if (!Array.isArray(config)) {
    config = [config];
  }
  if (config.some((c) => typeof c === "string")) {
    config = [{ paths: config }];
  }
  return config.flatMap((c) => {
    const plugin = fullReload(c.paths, c.config);
    plugin.__prismajs_plugin_config = c;
    return plugin;
  });
}

function resolveDevServerUrl(address, config, userConfig) {
  const configHmrProtocol = typeof config.server.hmr === "object" ? config.server.hmr.protocol : null;
  const clientProtocol = configHmrProtocol ? configHmrProtocol === "wss" ? "https" : "http" : null;
  const serverProtocol = config.server.https ? "https" : "http";
  const protocol = clientProtocol ?? serverProtocol;
  const configHmrHost = typeof config.server.hmr === "object" ? config.server.hmr.host : null;
  const configHost = typeof config.server.host === "string" ? config.server.host : null;
  const sailHost = process.env.PRISMAJS_SAIL && !userConfig.server?.host ? "localhost" : null;
  const serverAddress = isIpv6(address) ? `[${address.address}]` : address.address;
  const host = configHmrHost ?? sailHost ?? configHost ?? serverAddress;
  const configHmrClientPort = typeof config.server.hmr === "object" ? config.server.hmr.clientPort : null;
  const port = configHmrClientPort ?? address.port;
  return `${protocol}://${host}:${port}`;
}

function isIpv6(address) {
  return address.family === "IPv6" || address.family === 6;
}

function noExternalInertiaHelpers(config) {
  const userNoExternal = config.ssr?.noExternal;
  const pluginNoExternal = ["prismajs-vite-plugin"];
  if (userNoExternal === true) {
    return true;
  }
  if (typeof userNoExternal === "undefined") {
    return pluginNoExternal;
  }
  return [
    ...Array.isArray(userNoExternal) ? userNoExternal : [userNoExternal],
    ...pluginNoExternal
  ];
}

function resolveEnvironmentServerConfig(env) {
  if (!env.VITE_DEV_SERVER_KEY && !env.VITE_DEV_SERVER_CERT) {
    return;
  }
  if (!fs.existsSync(env.VITE_DEV_SERVER_KEY) || !fs.existsSync(env.VITE_DEV_SERVER_CERT)) {
    throw Error(`Unable to find the certificate files specified in your environment. Ensure you have correctly configured VITE_DEV_SERVER_KEY: [${env.VITE_DEV_SERVER_KEY}] and VITE_DEV_SERVER_CERT: [${env.VITE_DEV_SERVER_CERT}].`);
  }
  const host = resolveHostFromEnv(env);
  if (!host) {
    throw Error(`Unable to determine the host from the environment's APP_URL: [${env.APP_URL}].`);
  }
  return {
    hmr: { host },
    host,
    https: {
      key: fs.readFileSync(env.VITE_DEV_SERVER_KEY),
      cert: fs.readFileSync(env.VITE_DEV_SERVER_CERT)
    }
  };
}

function resolveHostFromEnv(env) {
  try {
    return new URL(env.APP_URL).host;
  } catch {
    return;
  }
}

function resolveDevelopmentEnvironmentServerConfig(host) {
  if (host === false) {
    return;
  }
  const configPath = determineDevelopmentEnvironmentConfigPath();
  host = host === true ? resolveDevelopmentEnvironmentHost(configPath) : host;
  const keyPath = path.resolve(configPath, "Certificates", `${host}.key`);
  const certPath = path.resolve(configPath, "Certificates", `${host}.crt`);
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw Error(`Unable to find certificate files for your host [${host}] in the [${configPath}/Certificates] directory. Ensure you have secured the site via the Herd UI or run \`valet secure\`.`);
  }
  return {
    hmr: { host },
    host,
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  };
}

function determineDevelopmentEnvironmentConfigPath() {
  const herdConfigPath = path.resolve(os.homedir(), "Library", "Application Support", "Herd", "config", "valet");
  if (fs.existsSync(herdConfigPath)) {
    return herdConfigPath;
  }
  return path.resolve(os.homedir(), ".config", "valet");
}

function resolveDevelopmentEnvironmentHost(configPath) {
  const configFile = path.resolve(configPath, "config.json");
  if (!fs.existsSync(configFile)) {
    throw Error(`Unable to find the configuration file [${configFile}]. You will need to manually specify the host in the \`detectTls\` configuration option.`);
  }
  const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
  return path.basename(process.cwd()) + "." + config.tld;
}

function dirname() {
  return fileURLToPath(new URL(".", import.meta.url));
}

export {
  prismajs as default,
  refreshPaths
};
