import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";

const colors = new Map();

/**
 * @param {(import("three").MeshBasicMaterialParameters|import("three").MeshStandardMaterialParameters)?} opts
 */
export function solid(opts) {
    const key = Object
        .keys(opts)
        .map(k => `${k}:${opts[k]}`)
        .join(",");

    if (!colors.has(key)) {
        if (opts.lit !== false) {
            colors.set(key, new MeshStandardMaterial(opts));
        }
        else {
            colors.set(key, new MeshBasicMaterial(opts));
        }
    }

    return colors.get(key);
}