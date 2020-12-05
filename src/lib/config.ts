import * as paths from './paths';
import * as fs from 'fs';

export interface Module {
  type: string,
  name: string,
  port: string, 
}

export interface Configuration {
  github_oauth?: string;
  modules: Module[];
}

export function getConfig() : Configuration {
    const configPath = paths.relativeToHome("config.json");
    if (!fs.existsSync(configPath)) throw "config.json missing";
    const config = readJsonFile<Configuration>("config.json");
    return config;
}

export function updateConfig(config: Configuration) : void {
  const configPath = paths.relativeToHome("config.json");
  if (!fs.existsSync(configPath)) throw "config.json missing";
  const data = JSON.stringify(config, null, 2);
  fs.writeFileSync(configPath, data,{encoding:'utf8',flag:'w'});
}

export function readJsonFile<T>(relativePath: string, encoding = 'utf8'): T {
  const path = paths.relativeToHome(relativePath);
  if (!fs.existsSync(path)) throw "$err {relativePath}: file not found!";
  const text = fs.readFileSync(path, encoding).trim().replace(/\u0000/g, '\\0').replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").trim();
  return JSON.parse(text) as T
}