import * as path from 'path';
import * as fs from 'fs';

export const HOME_PATH = process.env.CI_PROJECT_DIR ? path.join(process.env.CI_PROJECT_DIR, "..") : path.join(__dirname, "../../../")

export const CLI_PATH = path.join(__dirname, "../../../")

export function relativeToHome(relativePath : string){
  return path.join(HOME_PATH, relativePath);
}

export function relativeToCLI(relativePath : string){
  return path.join(CLI_PATH, relativePath);
}

export function ensureFolder(fullPath : string){
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive : true});
  }
}
