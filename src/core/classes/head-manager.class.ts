import { render } from 'preact-render-to-string';

import { Injectable } from '../decorators/injectable.decorator';

@Injectable()
export class HeadManager {
  private readonly _html: string[] = [];

  add(elements?: JSX.Element[]): void;
  add(element?: JSX.Element): void;
  add(elements?: JSX.Element | JSX.Element[]): void {
    elements = [elements].flat().filter(Boolean) as JSX.Element[];

    for (const el of elements) {
      this._html.push(render(el));
    }
  }

  html(): string {
    return this._html.join('');
  }
}
