import {Color} from './color';

export class Canvas {

    static write_pixel(canvas: Canvas, row: number, col: number, color: Color): void {
        canvas.colors[row][col] = color;
    }

    static canvas_to_ppm(canvas: Canvas): string[] {
        let ppm = ['P3', canvas.width.toString() + ' ' + canvas.height.toString(), '255'];

        for (let h = 0; h < canvas.height; h++) {
            let r = '';

            for (let w = 0; w < canvas.width; w++) {
                if (w > 0) {
                    r += ' '
                }
                r += Color.asPPMString(canvas.colors[h][w]);
            }

            let strings = r.split(' ');
            while (strings.length > 0) {
                ppm.push(strings.slice(0, 17).join(' '));
                strings = strings.slice(17);
            }
        }
        ppm.push('');

        return ppm;
    }

    data: Color[][] = [];

    constructor(public readonly width: number, public readonly height: number) {
        for (let h = 0; h < height; h++) {
            let row: Color[] = [];
            for (let w = 0; w < width; w++) {
                row[w] = new Color(0, 0, 0);
            }
            this.data[h] = row;
        }
    }

    get colors(): Color[][] {
        return this.data;
    }


}