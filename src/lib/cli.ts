

import { cli, ActionBase } from 'cli-ux';

export async function runAction(message: string, action : () => Promise<any>){
  cli.action.start(message);
  try{
    await action();
    cli.action.stop();
  }
  catch(e){
    cli.action.stop("FAILED");
    throw e;
  }
}
