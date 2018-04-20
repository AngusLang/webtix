/**
 * more into see doc/OBJLoader.md
 */


import { TextureBuffer } from "../core/TextureBuffer";
import { Color3 } from "../math/Color3";

const re_space   = /\s+/;

// obj file pattern
const re_vector = /^v\s/;
const re_normal = /^vn\s/;
const re_face   = /^f\s/;
const re_mtllib = /^mtllib\s/; 
const re_usemtl = /^usemtl\s/;

// mtl file pattern
const re_ka         = /^Ka\s/;
const re_kd         = /^Kd\s/;
const re_ks         = /^Ks\s/;
const re_ke         = /^Ke\s/;
const re_refract    = /^Ni\s/;
const re_opacity    = /^d\s/;
const re_illum      = /^illum\s/;
const re_newmtl     = /^newmtl\s/;

const ground = [
    0, 1, 0, 100, 0, 100, 100, 0, -100, -100, 0, -100,
    0, 1, 0, 100, 0 ,100, -100, 0, -100, -100, 0, 100
];

export class OBJPackage {
    constructor(
        public objData: OBJData,
        public mtlData: MTLData
    ) {}
}

export class OBJData {
    constructor(
        public vertices: Array<Array<number>>,
        public normals: Array<Array<number>>,
        public faces: Array<Array<number>>,
    ) {}
}
/**
 * 
 * MTL file description
 * 
 * Ns <roughness>
 * Ka <ambient color>
 * Kd <diffuse color>
 * Ks <specular color>
 * Ke <emissive color>
 * Ni <refract scalar>
 * d  <opacity>
 * illum <illumination model>
 * 
 * wavefront file illumination models
 * 
 * 0. Color on and Ambient off
 * 1. Color on and Ambient on
 * 2. Highlight on
 * 3. Reflection on and Ray trace on
 * 4. Transparency: Glass on, Reflection: Ray trace on
 * 5. Reflection: Fresnel on and Ray trace on
 * 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
 * 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
 * 8. Reflection on and Ray trace off
 * 9. Transparency: Glass on, Reflection: Ray trace off
 * 10. Casts shadows onto invisible surfaces
 * 
 * 
 */
export class MaterialNode {
    constructor(public name: string) {}

    ambient: Color3;
    diffuse: Color3;
    specular: Color3;
    emissive: Color3;
    refract: number;
    opacity: number;
    illumination: number;
}

export class MTLData {
    constructor(
        public materials: MaterialNode[]
    ) {}
}

function objProcess(data: string, materils: MaterialNode[]) {
    const res = [];
    const vs = [];
    const vn = [];
    const fs = [];
    let mtl_index = -1;

    const lines = data.split('\n');
    let i = -1;
    while ( ++i < lines.length) {
        const line = lines[i].trim();
        const elements = line.split(re_space);
        elements.shift();

        if ( re_vector.test( line ) ) {
            vs.push([parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2])]);
        } else if ( re_normal.test( line ) ) {
            vn.push([parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2])]);
        } else if ( re_face.test(line) ) {
            
            let j  = -1
            let indices = [];

            while (++j < elements.length) {
                var is = elements[j].split('/')
                indices.push(parseFloat(is[0]) - 1, parseFloat(is[2]) - 1, mtl_index);
            }
            fs.push(indices);
        } else if ( re_usemtl.test(line) && materils.length > 0) {
            const mtlName = elements[0];
            let index = 0;
            for(;index < materils.length; ++index) {
                if (mtlName === materils[index].name) {
                    mtl_index = index;
                    continue;
                }
            }
        }
    }

    return new OBJData(vs, vn, fs);
}

function mtlProcess(data: string) {

    const mtls = [];
    let mtl: MaterialNode;
    const lines = data.split('\n');
    let i = -1;
    while ( ++i < lines.length) {
        const line = lines[i].trim();
        const elements = line.split(re_space);
        elements.shift();
        
        if ( re_newmtl.test( line ) ) {
            if (mtl) {
                mtls.push(mtl);
            }
            mtl = new MaterialNode(elements[0]);
        } else if ( re_kd.test(line) ) {
            if (mtl) {
                mtl.diffuse = new Color3(parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2]));
            }
        }
    }

    mtls.push(mtl);
    return mtls;
}

export async function OBJLoader( path, fileName ): Promise<OBJPackage> {
    const mtlResponse = await fetch(path + '/' + fileName + '.mtl');
    const mtlData = await mtlResponse.text();
    const mtlGroup = mtlProcess(mtlData);

    const objResponse = await fetch(path + '/' + fileName + '.obj');
    const objData = await objResponse.text();

    return new OBJPackage(objProcess(objData, mtlGroup), new MTLData(mtlGroup));
}