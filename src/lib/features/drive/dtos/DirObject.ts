import BaseDTO from "$lib/utils/models/BaseDTO"
import type { CloudFile } from "./CloudFile"

export type DirObject = CloudFile & {
    contents: DirObject[],
    count: number
}

export class PathObjectDto extends BaseDTO<DirObject> {}