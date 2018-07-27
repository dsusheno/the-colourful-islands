import { Component, OnInit, ViewChild } from '@angular/core';

const SIZE = 50;
const SEA_LAND_RATIO = 40;

enum AreaStatus {
  Sea = 0,
  Land = 1,
  Discovered = 2,
}

const SEA_COLOR = '#cbe1ff';
const LAND_COLOR = '#bbbbbb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public title = 'The Island Discovery';
  public canvasWidth = 800;
  public canvasHeight = 800;
  public island: number[] = new Array(SIZE * SIZE);
  public color: string[] = new Array(SIZE * SIZE);
  public newColor: string = '#00FF00';
  public timeGeneration = 0;
  public numberOfIslands = 0;

  @ViewChild('canvasElement')
  public canvasEl;

  @ViewChild('inputElement')
  public inputEl;

  private position;

  public ngOnInit() {
    this.generate();

    const start = performance.now();
    this.findIslands();
    const end = performance.now();
    this.timeGeneration = Math.floor((end - start) * 100) / 100;

    this.attachEventListeners();
    this.render();
  }

  public onColorChanged(event: Event) {
    // Write your code below.
    this.newColor = (<HTMLTextAreaElement>event.currentTarget).value;
  }

  private getInitialColor(value: number): string {
    if (value === AreaStatus.Land) {
      return LAND_COLOR;
    }
    return SEA_COLOR;
  }

  private setValueAt(row: number, column: number, value: number) {
    this.island[row * SIZE + column] = value;
  }

  private getValueAt(row: number, column: number): number {
    return this.island[row * SIZE + column];
  }

  private setIslandColor(row: number, column: number, value: string) {
    this.color[row * SIZE + column] = value;
  }

  private getIslandColor(row: number, column: number): string {
    return this.color[row * SIZE + column];
  }

  /**
   * generate new island
   */
  private generate() {

    let state, color;
    for (let col = 0; col < SIZE; col++) {
      for (let row = 0; row < SIZE; row++) {
        state = Math.round(Math.random() * 100);
        const area = state >= SEA_LAND_RATIO ? AreaStatus.Sea : AreaStatus.Land;
        color = this.getInitialColor(area);

        this.setValueAt(row, col, area);
        this.setIslandColor(row, col, color);
      }
    }
  }

  /**
   * render the island into the canvas Element
   */
  private render() {

    const canvas = this.canvasEl.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');

    const squareWidth = Math.floor(canvas.width / SIZE);
    const squareHeight = Math.floor(canvas.height / SIZE);

    let x, y;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        ctx.fillStyle = this.getIslandColor(row, col);
        y = row * squareHeight;
        x = col * squareWidth;
        ctx.fillRect(x, y, squareWidth, squareHeight);
        ctx.fillStyle = '#000';
      }
    }
  }

  /**
   * generate random color
   * @return {string}
   */
  private generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    const color = ['#'];
    for (let i = 0; i < 6; i++) {
      color.push(letters[Math.floor(Math.random() * 16)]);
    }
    return color.join('');
  }

  /**
   * attach event listeners
   */

  //Color Island with a mouse click
  private mouseClick(event) {

    const canvasElement = event.target.getBoundingClientRect();
    const canvasX = event.clientX - canvasElement.left;
    const canvasY = event.clientY - canvasElement.top;

    const col = Math.floor(SIZE / canvasElement.width * canvasX);
    const row = Math.floor(SIZE / canvasElement.height * canvasY);
    
    //Change status of the island's area from Discover to Land to be able to color it again with Recursive Island Search
    this.recursiveSetValue(row, col, this.newColor, AreaStatus.Land);
    this.recursiveSetValue(row, col, this.newColor, AreaStatus.Discovered);

    this.render();
  }

  private attachEventListeners() {
    // Write your code below.
    this.canvasEl.nativeElement.addEventListener('click', this.mouseClick.bind(this) , false);
  }

  /**
   * discover islands and apply a new color to each of them.
   * the definition of an Island is : All LAND square that connect to an other LAND square
   */

  /**
   * Recursive Island Search
   * We can apply this method only to change Land => Discover || Discover => Land
   */
  private recursiveSetValue(row: number, column: number, color: string, setValue: number){
    let state = this.getValueAt(row, column);
    let valueToChange : number;
    
    if (setValue == AreaStatus.Land)
      valueToChange = AreaStatus.Discovered;
    else if (setValue == AreaStatus.Discovered)
      valueToChange = AreaStatus.Land;

    if (state == valueToChange)
    {
      this.setIslandColor(row, column, color);
      this.setValueAt(row, column, setValue);

      if (column + 1 < SIZE && this.getValueAt(row, column + 1) == valueToChange)
        this.recursiveSetValue(row, column + 1, color, setValue);

      if (column - 1 >= 0 && this.getValueAt(row, column - 1) == valueToChange)
        this.recursiveSetValue(row, column - 1, color, setValue);

      if (row + 1 < SIZE && column + 1 < SIZE && this.getValueAt(row + 1, column + 1) == valueToChange)
        this.recursiveSetValue(row + 1, column + 1, color, setValue);

      if (row - 1 >= 0 && column - 1 >= 0 && this.getValueAt(row - 1, column - 1) == valueToChange)
        this.recursiveSetValue(row - 1, column - 1, color, setValue);

      if (row + 1 < SIZE && this.getValueAt(row + 1, column) == valueToChange)
        this.recursiveSetValue(row + 1, column, color, setValue);

      if (row - 1 >= 0 && this.getValueAt(row - 1, column) == valueToChange)
        this.recursiveSetValue(row - 1, column, color, setValue);

      if (row + 1 < SIZE && column - 1 >= 0 && this.getValueAt(row + 1, column - 1) == valueToChange)
        this.recursiveSetValue(row + 1, column - 1, color, setValue);

      if (row - 1 >= 0 && column + 1 < SIZE && this.getValueAt(row - 1, column + 1) == valueToChange)
        this.recursiveSetValue(row - 1, column + 1, color, setValue);
    }
  }

  //Set unique color for each island
  private searchUniqueColor(allColors: String[]) : string {
    let color = this.generateRandomColor();

    if (allColors.indexOf(color) != -1) {
      color = this.searchUniqueColor(allColors);
    }

    return color;
  }
  private findIslands() {
    // Write your code below.
    let color : string;
    let allColors : String[] = [];
    let state : number;

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        state = this.getValueAt(row, col);

        if (state == AreaStatus.Land)
        {
          this.numberOfIslands++;

          color = this.searchUniqueColor(allColors);
          allColors.push(color);

          this.recursiveSetValue(row, col, color, AreaStatus.Discovered);
        }
      }
    }
  }
}
