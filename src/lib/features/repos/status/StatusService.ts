import { invoke } from "@tauri-apps/api/core";
import type FileStatus from "./FileStatus";
import StatusParser from "./StatusParser";

export default class StatusService {

  public static async getStatus(rootPath: string, filter: string[], start?: number, end?: number): Promise<FileStatus[]> {
    try {
      const filterStr = filter.join(",");

      let res: string;

      if (start !== undefined && end !== undefined) {
        res = await invoke("vcs_rstatus_ranged", { rootPath, filter: filterStr, start, end });
      } else {
        res = await invoke("vcs_rstatus", { rootPath, filter: filterStr });
      }

      console.log(res)

      if (res == "Clean") {
        return [];
      }

      return StatusParser.parseStatusString(res as string);
    }
    catch (error) {
      throw error;
    }
  }
}
