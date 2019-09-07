import {binding, given, then, when} from 'cucumber-tsflow';
import {parseArg, shouldEqualMsg, Workspace} from './Workspace';
import {color_at, default_world, intersect_world, shade_hit, World} from '../../src/world';
import {expect} from 'chai';
import {Color} from '../../src/color';
import {Sphere} from '../../src/sphere';
import {fail} from 'assert';
import {Matrix, scaling} from '../../src/matrix';
import {Material} from '../../src/material';
import {PreComputations} from "../../src/pre-computations";
import {Light} from "../../src/light";
import {point} from "../../src/tuple";

@binding([Workspace])
class WorldsSteps {

    constructor(protected workspace: Workspace) {
    }

    @when(/^([\w\d_]+) ← world\(\)$/)
    public whenWorldCreated(worldId: string) {
        this.workspace.worlds[worldId] = new World();
    }

    @then(/^([^,]+) contains no objects$/)
    public thenEmptyObjects(worldId: string) {
        const actual = this.workspace.worlds[worldId].objects.length;
        const expected = 0;
        expect(actual, shouldEqualMsg(actual, expected)).to.equal(expected);
    }

    @then(/^([^,]+) has no light source$/)
    public thenEmptyLisghts(worldId: string) {
        const actual = this.workspace.worlds[worldId].lights.length;
        const expected = 0;
        expect(actual, shouldEqualMsg(actual, expected)).to.equal(expected);
    }

    @given(/^([\w\d_]+) ← sphere\(\) with:$/)
    public givenSphereByProperties(sphereId: string, dataTable: { rawTable: [][] }) {
        this.workspace.spheres[sphereId] = parseRawTable(dataTable.rawTable);
    }

    @when(/^([\w\d_]+) ← default_world\(\)$/)
    public whenDefaultWorld(worldId: string) {
        this.workspace.worlds[worldId] = default_world();
    }

    @then(/^([\w\d_]+).light = ([^,]+)$/)
    public thenWorldLightEquals(worldId: string, lightId: string) {
        const actual = this.workspace.worlds[worldId].contains(this.workspace.lights[lightId]);
        return expect(actual,
            'world: ' + JSON.stringify(this.workspace.worlds[worldId]) + ' should have '
            + JSON.stringify(this.workspace.lights[lightId])
        ).to.be.true;
    }

    @then(/^([^,]+) contains ([^, ]+)$/)
    public thenWorldContainsSphere(worldId: string, objectId: string) {
        const actual = this.workspace.worlds[worldId].contains(this.workspace.spheres[objectId]);
        return expect(actual,
            'world: ' + JSON.stringify(this.workspace.worlds[worldId]) + ' should have '
            + JSON.stringify(this.workspace.spheres[objectId])).to.be.true;
    }

    @when(/^([\w\d_]+) ← intersect_world\(([^,]+), ([^,]+)\)$/)
    public whenIntersectWorld(xsId: string, worldId: string, rayId: string) {
        this.workspace.intersections[xsId] = intersect_world(
            this.workspace.worlds[worldId],
            this.workspace.rays[rayId]
        );
    }

    @given(/^([\w\d_]+) ← the first object in ([^,]+)$/)
    public givenFirstObjectInWorld(objId: string, worldId: string) {
        this.workspace.spheres[objId] = this.workspace.worlds[worldId].objects[0];
    }

    @when(/^([\w\d_]+) ← shade_hit\(([^,]+), ([^,]+)\)$/)
    public whenShadeHit(colorId: string, worldId: string, pcId: string) {
        this.workspace.colors[colorId] = shade_hit(
            this.workspace.worlds[worldId],
            this.workspace.intersection[pcId] as PreComputations
        );
    }

    @given(/^([\w\d_]+).light ← point_light\(point\(([^,]+), ([^,]+), ([^,]+)\), color\(([^,]+), ([^,]+), ([^,]+)\)\)$/)
    public givenWorldLight(worldid: string, x: string, y: string, z: string, r: string, g: string, b: string) {
        this.workspace.worlds[worldid] = new World(
            [
                new Light(point(parseArg(x), parseArg(y), parseArg(z)), new Color(parseArg(r), parseArg(g), parseArg(b)))
            ],
            this.workspace.worlds[worldid].objects
        );
    }

    @given(/^([\w\d_]+) ← the second object in ([^,]+)$/)
    public givenSecondObjectInWorld(objId: string, worldId: string) {
        this.workspace.spheres[objId] = this.workspace.worlds[worldId].objects[1];
    }

    @when(/^([\w\d_]+) ← color_at\(([\w\d_]+), ([\w\d_]+)\)$/)
    public whenColorAt(colorID: string, worldId: string, rayId: string) {
        this.workspace.colors[colorID] = color_at(this.workspace.worlds[worldId], this.workspace.rays[rayId]);
    }

}

function parseRawTable(data: string[][]): Sphere {

    const rows = data.length;
    const cold = data[0].length;
    let color: Color = new Color(1, 1, 1);
    const ambient = 0.1;
    let diffuse = 0.9;
    let specular = 0.9;
    const shininess = 200.0;
    let t = Matrix.identity(4);
    for (let r = 0; r < rows; ++r) {
        switch (data[r][0]) {
            case 'material.color':
                color = new Color(0.8, 1.0, 0.6);
                break;
            case 'material.diffuse':
                diffuse = parseArg(data[r][1]);
                break;
            case 'material.specular':
                specular = parseArg(data[r][1]);
                break;
            case 'transform':
                t = scaling(0.5, 0.5, 0.5);
                break;
            default:
                fail('Unexpected field');
        }
    }
    const m = new Material(color, ambient, diffuse, specular, shininess);

    return new Sphere(t, m);
}

export = WorldsSteps;