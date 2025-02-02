import { CheerioAPI, load, type Cheerio } from 'cheerio';

//
interface BaseComponent {
  type: string;
  id?: string;
}

interface TitleSection extends BaseComponent {
  type: 'title-section';
  title: string;
  subtitle?: string;
}

interface InputField extends BaseComponent {
  type: 'input-field';
  placeholder?: string;
}

interface CheckboxField extends BaseComponent {
  type: 'checkbox';
  label: string;
  checked: boolean;
}

interface RadioButton extends BaseComponent {
  type: 'radio-button';
  label: string;
  name: string;
  checked: boolean;
}

interface TextArea extends BaseComponent {
  type: 'text-area';
  placeholder?: string;
  rows: number;
  cols: number;
}

interface HtmlContent extends BaseComponent {
  type: 'html';
  tag: string;
  content: string;
  attributes: Record<string, string>;
}

export interface ContentSection {
  title?: TitleSection;
  components: (
    | TitleSection
    | InputField
    | CheckboxField
    | RadioButton
    | TextArea
    | HtmlContent
  )[];
}

type ComponentParser = ($element: Cheerio<any>, $: CheerioAPI) => BaseComponent;

class ContentParser {
  private componentParsers: Map<string, ComponentParser>;

  constructor() {
    this.componentParsers = new Map();
    this.registerDefaultParsers();
  }

  private registerDefaultParsers() {
    this.registerParser('title-section', this.parseTitleSection);
    this.registerParser('input-field', this.parseInputField);
    this.registerParser('checkbox', this.parseCheckbox);
    this.registerParser('radio-button', this.parseRadioButton);
    this.registerParser('text-area', this.parseTextArea);
  }

  public registerParser(dataId: string, parser: ComponentParser) {
    this.componentParsers.set(dataId, parser);
  }

  private parseTitleSection = (
    $element: Cheerio<any>,
    $: CheerioAPI,
  ): TitleSection => {
    const $title = $element.find('h1');
    const $subtitle = $element.find('p');

    return {
      type: 'title-section',
      id: $element.attr('data-id'),
      title: $title.text().trim(),
      subtitle: $subtitle.text().trim(),
    };
  };

  private parseInputField = (
    $element: Cheerio<any>,
    $: CheerioAPI,
  ): InputField => {
    return {
      type: 'input-field',
      id: $element.attr('data-id'),
      placeholder: $element.attr('placeholder'),
    };
  };

  private parseCheckbox = (
    $element: Cheerio<any>,
    $: CheerioAPI,
  ): CheckboxField => {
    const $input = $element.find('input[type="checkbox"]');
    return {
      type: 'checkbox',
      id: $element.attr('data-id'),
      label: $element.text().trim(),
      checked: $input.prop('checked') === 'true',
    };
  };

  private parseRadioButton = (
    $element: Cheerio<any>,
    $: CheerioAPI,
  ): RadioButton => {
    const $input = $element.find('input[type="radio"]');
    return {
      type: 'radio-button',
      id: $element.attr('data-id'),
      label: $element.text().trim(),
      name: $input.attr('name') || '',
      checked: $input.prop('checked') === 'true',
    };
  };

  private parseTextArea = ($element: Cheerio<any>, $: CheerioAPI): TextArea => {
    return {
      type: 'text-area',
      id: $element.attr('data-id'),
      placeholder: $element.attr('placeholder'),
      rows: parseInt($element.attr('rows') || '4'),
      cols: parseInt($element.attr('cols') || '50'),
    };
  };

  private parseHtmlContent = (
    $element: Cheerio<any>,
    $: CheerioAPI,
  ): HtmlContent => {
    const attributes: Record<string, string> = {};
    const el = $element.get(0);

    if (el) {
      const attribs = (el as any).attribs || {};
      Object.keys(attribs).forEach((attr: string) => {
        attributes[attr] = attribs[attr] || '';
      });
    }

    return {
      type: 'html',
      tag: el ? (el as any).name || 'div' : 'div',
      content: $element.html() || '',
      attributes,
    };
  };

  public parse(htmlContent: string): ContentSection[] {
    const $ = load(htmlContent);
    const sections: ContentSection[] = [];
    let currentSection: ContentSection = { components: [] };

    $('body > *').each((_, element) => {
      const $element = $(element);
      const dataId = $element.attr('data-id');

      if (dataId === 'title-section') {
        if (currentSection.components.length > 0) {
          sections.push(currentSection);
        }

        currentSection = {
          title: this.parseTitleSection($element, $),
          components: [],
        };
      } else {
        let component: BaseComponent;

        if (dataId && this.componentParsers.has(dataId)) {
          const parser = this.componentParsers.get(dataId)!;
          component = parser($element, $);
        } else {
          component = this.parseHtmlContent($element, $);
        }

        currentSection.components.push(component as any);
      }
    });

    if (currentSection.components.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }
}

export const createParser = () => new ContentParser();

// import * as cheerio from 'cheerio';

// export default function parseHtmlToJson(html: string): any {
//   const $ = cheerio.load(html);

//   const parseNode = (node: any): any => {
//     const tagName = node.tagName;
//     const children = $(node).contents().toArray();
//     const className = $(node).attr('class') || '';
//     const style = $(node).attr('style') || '';

//     switch (tagName) {
//       case 'h1':
//       case 'h2':
//       case 'h3':
//       case 'h4':
//       case 'h5':
//       case 'h6': {
//         return {
//           type: 'heading',
//           level: parseInt(tagName[1], 10),
//           content: $(node).text().trim(),
//           styling: { className, style },
//         };
//       }
//       case 'p': {
//         return {
//           type: 'paragraph',
//           content: $(node).text().trim(),
//           styling: { className, style },
//         };
//       }
//       case 'table': {
//         const rows = [];
//         $(node)
//           .find('tr')
//           .each((_, row) => {
//             const cells = [];
//             $(row)
//               .find('td, th')
//               .each((__, cell) => {
//                 cells.push($(cell).text().trim());
//               });
//             rows.push(cells);
//           });
//         return {
//           type: 'table',
//           rows,
//           styling: { className, style },
//         };
//       }
//       case 'img': {
//         return {
//           type: 'image',
//           src: $(node).attr('src'),
//           alt: $(node).attr('alt') || '',
//           styling: { className, style },
//         };
//       }
//       case 'ul':
//       case 'ol': {
//         const items = [];
//         $(node)
//           .find('li')
//           .each((_, li) => {
//             items.push(parseNode(li));
//           });
//         return {
//           type: tagName === 'ul' ? 'unorderedList' : 'orderedList',
//           items,
//           styling: { className, style },
//         };
//       }
//       case 'li': {
//         return {
//           type: 'listItem',
//           content: $(node).text().trim(),
//           styling: { className, style },
//         };
//       }
//       case 'input': {
//         return {
//           type: 'input',
//           inputType: $(node).attr('type') || 'text',
//           placeholder: $(node).attr('placeholder') || '',
//           name: $(node).attr('name') || '',
//           value: $(node).attr('value') || '',
//           styling: { className, style },
//         };
//       }
//       case 'button': {
//         return {
//           type: 'button',
//           label: $(node).text().trim(),
//           action: $(node).attr('type') || 'button',
//           styling: { className, style },
//         };
//       }
//       default: {
//         // For unknown elements or containers
//         if (children.length > 0) {
//           return {
//             type: 'container',
//             tag: tagName,
//             children: children.map((child) => parseNode(child)),
//             styling: { className, style },
//           };
//         } else {
//           return {
//             type: 'text',
//             content: $(node).text().trim(),
//             styling: { className, style },
//           };
//         }
//       }
//     }
//   };

//   const body = $('body').children().toArray();
//   const parsed = body.map((child) => parseNode(child));
//   return {
//     type: 'container',
//     children: parsed,
//   };
// }
