// Any tilesets with "-" in the name (such as "initial-commit" in 2048Clone theme) will be replaced with a space.
export function formatTilesetName(tileset: string) {
    return tileset.replace("-", " ");
}
