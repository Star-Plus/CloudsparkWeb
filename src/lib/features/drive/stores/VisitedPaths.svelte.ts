import type { DirObject } from "../dtos/DirObject";

export default class VisitedPaths {
    private static instance: VisitedPaths;
    private visited: DirObject[];
    
    public static getInstance(): VisitedPaths {
        if (!VisitedPaths.instance) {
            VisitedPaths.instance = new VisitedPaths();
        }
        return VisitedPaths.instance;
    }

    private constructor() {
        this.visited = [];
    }

    public expand(subTree: DirObject) {
        const node = this.visited.find((c) => c.path === subTree.path);
        if (node) node.contents = subTree.contents;
        else this.visited.push(subTree);
    }

    public getPathObject(path: string): DirObject | null {
        let node = this.visited.find((c) => c.path === path);
        if (node == undefined) return null;

        while (node) {
            if (node.path === path) {
                return node;
            }

            const matchedAncestor: DirObject | undefined = node.contents.find((c) => c.path === path);
            if (matchedAncestor) node = matchedAncestor;
            else return null;
        }
        return null;
    }
}