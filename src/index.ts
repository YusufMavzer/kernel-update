import {Command, flags} from '@oclif/command'
import axios from 'axios';
import { parse } from 'node-html-parser';
import { exec } from './lib/process';
import { ensureFolder, relativeToCLI } from './lib/paths';
import https from 'https';
import fs from 'fs';
import { IncomingMessage } from "http";

class KernelUpdate extends Command {
  static description = 'Update ubuntu kernel with mainline'

  static flags = {}
  static args = []

  async run() {
    const {args, flags} = this.parse(KernelUpdate)
    const regex = /amd64\/linux-(?:headers|image-unsigned|modules)-(.*?-.*?(?:-generic))_.*?-.*_amd64.deb/g;
    const regex1 = /amd64\/linux-(?:headers|image-unsigned|modules)-(.*?-.*?)_.*?-.*_all.deb/g;
    const baseURL = "https://kernel.ubuntu.com/~kernel-ppa/mainline/daily/current/";
    const response = await axios.get(baseURL);
    if(response.status != 200) {
      this.log("Cannot make connection with ubuntu mainline ppa");
      return;
    }
    const href = parse(response.data)
      .querySelectorAll('a')
      .map(i => i.getAttribute('href'))
      .filter(i => i != undefined)
      .filter(uri => uri?.match(regex) || uri?.match(regex1));
    if(!href || (href && href.length != 4)) {
      this.log("not all url are available");
      return;
    }
    const groups = regex.exec(href[0] as string);
    const version = groups && groups[1].trim(); 

    const currenctVersion = await exec("uname -r");
    if (currenctVersion.trim() == version?.trim())
      return;
    const destinationDir = relativeToCLI(`kernels/${version}`);
    ensureFolder(destinationDir);

    const downloadTasks = href.map(i => this.downloadKernel({
      url: `${baseURL}${i}`,
      path:`${destinationDir }/${i?.substring(6)}` || ""
    }));
    await Promise.all(downloadTasks);
    this.log("download complete");
    this.log("start instal kernel");
    await exec("sudo dpkg -i *.deb", destinationDir);
    this.log("done");
  }


  async downloadKernel({url, path}: {url:string, path:string}): Promise<fs.WriteStream> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(path);
      https.get(url, (response: IncomingMessage) => {
        response.pipe(file);
        this.log(`file: ${path}`);
        resolve(file);
      });
    });
  }
}

export = KernelUpdate
