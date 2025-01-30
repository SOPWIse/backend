// import { CheerioAPI, load, type Cheerio } from 'cheerio';

// // Types for different components
// interface BaseComponent {
//   type: string;
//   id?: string;
// }

// interface TitleSection extends BaseComponent {
//   type: 'title-section';
//   title: string;
//   subtitle?: string;
// }

// interface InputField extends BaseComponent {
//   type: 'input-field';
//   placeholder?: string;
// }

// interface CheckboxField extends BaseComponent {
//   type: 'checkbox';
//   label: string;
//   checked: boolean;
// }

// interface RadioButton extends BaseComponent {
//   type: 'radio-button';
//   label: string;
//   name: string;
//   checked: boolean;
// }

// interface TextArea extends BaseComponent {
//   type: 'text-area';
//   placeholder?: string;
//   rows: number;
//   cols: number;
// }

// interface HtmlContent extends BaseComponent {
//   type: 'html';
//   tag: string;
//   content: string;
//   attributes: Record<string, string>;
// }

// // Section type that contains components
// export interface ContentSection {
//   title?: TitleSection;
//   components: (
//     | TitleSection
//     | InputField
//     | CheckboxField
//     | RadioButton
//     | TextArea
//     | HtmlContent
//   )[];
// }

// // Registry for component parsers
// type ComponentParser = ($element: Cheerio<any>, $: CheerioAPI) => BaseComponent;

// class ContentParser {
//   private componentParsers: Map<string, ComponentParser>;

//   constructor() {
//     this.componentParsers = new Map();
//     this.registerDefaultParsers();
//   }

//   // Register default component parsers
//   private registerDefaultParsers() {
//     this.registerParser('title-section', this.parseTitleSection);
//     this.registerParser('input-field', this.parseInputField);
//     this.registerParser('checkbox', this.parseCheckbox);
//     this.registerParser('radio-button', this.parseRadioButton);
//     this.registerParser('text-area', this.parseTextArea);
//   }

//   // Method to register new component parsers
//   public registerParser(dataId: string, parser: ComponentParser) {
//     this.componentParsers.set(dataId, parser);
//   }

//   // Parse title section
//   private parseTitleSection = (
//     $element: Cheerio<any>,
//     $: CheerioAPI,
//   ): TitleSection => {
//     const $title = $element.find('h1');
//     const $subtitle = $element.find('p');

//     return {
//       type: 'title-section',
//       id: $element.attr('data-id'),
//       title: $title.text().trim(),
//       subtitle: $subtitle.text().trim(),
//     };
//   };

//   // Parse input field
//   private parseInputField = (
//     $element: Cheerio<any>,
//     $: CheerioAPI,
//   ): InputField => {
//     return {
//       type: 'input-field',
//       id: $element.attr('data-id'),
//       placeholder: $element.attr('placeholder'),
//     };
//   };

//   // Parse checkbox
//   private parseCheckbox = (
//     $element: Cheerio<any>,
//     $: CheerioAPI,
//   ): CheckboxField => {
//     const $input = $element.find('input[type="checkbox"]');
//     return {
//       type: 'checkbox',
//       id: $element.attr('data-id'),
//       label: $element.text().trim(),
//       checked: $input.prop('checked') === 'true',
//     };
//   };

//   // Parse radio button
//   private parseRadioButton = (
//     $element: Cheerio<any>,
//     $: CheerioAPI,
//   ): RadioButton => {
//     const $input = $element.find('input[type="radio"]');
//     return {
//       type: 'radio-button',
//       id: $element.attr('data-id'),
//       label: $element.text().trim(),
//       name: $input.attr('name') || '',
//       checked: $input.prop('checked') === 'true',
//     };
//   };

//   // Parse text area
//   private parseTextArea = ($element: Cheerio<any>, $: CheerioAPI): TextArea => {
//     return {
//       type: 'text-area',
//       id: $element.attr('data-id'),
//       placeholder: $element.attr('placeholder'),
//       rows: parseInt($element.attr('rows') || '4'),
//       cols: parseInt($element.attr('cols') || '50'),
//     };
//   };

//   // Parse regular HTML content
//   private parseHtmlContent = (
//     $element: Cheerio<any>,
//     $: CheerioAPI,
//   ): HtmlContent => {
//     const attributes: Record<string, string> = {};
//     const el = $element.get(0);

//     // Get all attributes
//     if (el) {
//       const attribs = (el as any).attribs || {};
//       Object.keys(attribs).forEach((attr: string) => {
//         attributes[attr] = attribs[attr] || '';
//       });
//     }

//     return {
//       type: 'html',
//       tag: el ? (el as any).name || 'div' : 'div', // Changed from tagName to name
//       content: $element.html() || '',
//       attributes,
//     };
//   };

//   // Main parsing method
//   public parse(htmlContent: string): ContentSection[] {
//     const $ = load(htmlContent);
//     const sections: ContentSection[] = [];
//     let currentSection: ContentSection = { components: [] };

//     // Process each element at root level
//     $('body > *').each((_, element) => {
//       const $element = $(element);
//       const dataId = $element.attr('data-id');

//       // Check if element is a title section
//       if (dataId === 'title-section') {
//         // If we have an existing section with components, save it
//         if (currentSection.components.length > 0) {
//           sections.push(currentSection);
//         }
//         // Start a new section
//         currentSection = {
//           title: this.parseTitleSection($element, $),
//           components: [],
//         };
//       } else {
//         // Parse other components
//         let component: BaseComponent;

//         if (dataId && this.componentParsers.has(dataId)) {
//           // Use registered parser for known components
//           const parser = this.componentParsers.get(dataId)!;
//           component = parser($element, $);
//         } else {
//           // Parse as regular HTML content
//           component = this.parseHtmlContent($element, $);
//         }

//         currentSection.components.push(component as any);
//       }
//     });

//     // Add the last section if it has components
//     if (currentSection.components.length > 0) {
//       sections.push(currentSection);
//     }

//     return sections;
//   }
// }

// Usage example
// export const createParser = () => new ContentParser();

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
