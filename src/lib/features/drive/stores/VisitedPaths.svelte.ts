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
        if (!subTree?.path) return;

        const normalizedPath = subTree.path.replaceAll("\\", "/");
        const existingNode = this.findNode(normalizedPath);
        const node = existingNode ?? this.createPlaceholder(normalizedPath);

        if (!existingNode) {
            this.visited.push(node);
        }

        node.path = normalizedPath;
        node.name = subTree.name ?? node.name;
        node.type = subTree.type ?? node.type;
        node.contents = subTree.contents ?? [];
        node.count = subTree.count ?? node.contents.length;

        this.ensureParentChain(normalizedPath, node);
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

    private findNode(path: string): DirObject | undefined {
        return this.visited.find((c) => c.path === path);
    }

    private createPlaceholder(path: string): DirObject {
        const segments = path.split("/").filter(Boolean);
        const name = segments.length > 0 ? segments[segments.length - 1] : "root";

        return {
            name,
            path,
            size: 0,
            type: "folder",
            version: "",
            contents: [],
            count: 0,
        } as DirObject;
    }

    private ensureParentChain(path: string, targetNode: DirObject) {
        if (path === "/") return;

        const segments = path.split("/").filter(Boolean);
        let parentNode = this.ensureRootNode();

        for (let index = 0; index < segments.length; index++) {
            const segment = segments[index];
            const currentPath = parentNode.path === "/" ? `/${segment}` : `${parentNode.path}/${segment}`;
            const nextNode = index < segments.length - 1
                ? this.findNode(currentPath) ?? this.createPlaceholder(currentPath)
                : targetNode;

            this.attachChild(parentNode, nextNode);

            if (index < segments.length - 1) {
                if (!this.findNode(currentPath)) {
                    this.visited.push(nextNode);
                }
                parentNode = nextNode;
            }
        }
    }

    private ensureRootNode(): DirObject {
        const root = this.findNode("/");
        if (root) return root;

        const placeholder = this.createPlaceholder("/");
        this.visited.push(placeholder);
        return placeholder;
    }

    private attachChild(parentNode: DirObject, childNode: DirObject) {
        if (!parentNode.contents.some((child) => child.path === childNode.path)) {
            parentNode.contents.push(childNode);
            parentNode.count = parentNode.contents.length;
        }
    }
}