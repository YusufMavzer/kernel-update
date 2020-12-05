
import { spawn } from 'child_process';
import { relativeToHome, relativeToCLI } from '../paths';
import { cli } from 'cli-ux';

export function execRelativeToHomeFolder(cmd: string, cwd: string = ".", noStdout = false) : Promise<string> {
  return exec(cmd, relativeToHome(cwd), noStdout);
}

export function execRelativeToCLIFolder(cmd: string, cwd: string = ".", noStdout = false) : Promise<string> {
  return exec(cmd, relativeToCLI(cwd), noStdout);
}

export function exec(cmd: string | string[], cwd: string = ".", noStdout = false): Promise<string> {

  return new Promise((res, rej) => {

    var ret = "";

    var child = (Array.isArray(cmd))
      ? spawn(cmd[0], cmd.slice(1), { cwd: cwd })
      : spawn(cmd, { cwd: cwd, shell: true });

    child.stdout.on('data', function (data) {
      ret += data.toString();
      if(!noStdout){
        process.stdout.write(data.toString());
      }
    });

    child.stderr.on('data', function (data) {
      process.stdout.write(data.toString());
    });

    child.on('exit', function (code) {
      if (code) {
        if(noStdout){ // make sure we show output
          cli.warn(`Command failed! pwd:'${cwd}' cmd:'${cmd}'`);
          process.stdout.write(ret.toString());
        }
        rej(code);
      } else {
        res(ret.trim());
      }
    });
  });

}
