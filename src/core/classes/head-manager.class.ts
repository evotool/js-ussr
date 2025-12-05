import { VNode } from 'preact';
import { render } from 'preact-render-to-string';

import { Injectable } from '../decorators/injectable.decorator';

@Injectable()
export class HeadManager {
  private readonly _html: string[] = [];

  add(elements?: VNode<any>[]): void;
  add(element?: VNode<any>): void;
  add(elements?: VNode<any> | VNode<any>[]): void {
    elements = [elements].flat().filter(Boolean) as VNode<any>[];

    for (const el of elements) {
      this._html.push(render(el));
    }
  }

  html(): string {
    return this._html.join('');
  }
}
