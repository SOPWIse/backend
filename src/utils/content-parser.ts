/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseComponent,
  CheckboxField,
  ContentSection,
  HtmlContent,
  InputField,
  RadioButton,
  TextArea,
  TitleSection,
} from '@sopwise/types/content-parser.types';
import { CheerioAPI, load, type Cheerio } from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

let counter = 0;
type ComponentParser = ($element: Cheerio<never>, $: CheerioAPI) => BaseComponent | null;

export class ContentParser {
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

  private parseTitleSection = ($element: Cheerio<never>): TitleSection => {
    counter = 0;
    const $title = $element.find('h1');
    const $subtitle = $element.find('p');
    return {
      type: 'title-section',
      pk: uuidv4()?.concat('_title'),
      title: $title.text(),
      subtitle: $subtitle.text(),
      children: [],
    };
  };

  private parseProcedure = (): TitleSection => {
    counter++;
    return {
      type: 'title-section',
      pk: uuidv4().concat('_procedure'),
      title: `Step ${counter}`,
      subtitle: '',
      children: [],
    };
  };

  private parseInputField = ($element: Cheerio<never>): InputField => {
    const $input = $element.find('input[type="text"]');
    return {
      type: 'input-field',
      pk: uuidv4().concat('_input'),
      label: $element.text(),
      placeholder: $input.attr('placeholder') || '',
      children: [],
    };
  };

  private parseCheckbox = ($element: Cheerio<never>): CheckboxField => {
    const $input = $element.find('input[type="checkbox"]');
    return {
      type: 'checkbox',
      pk: uuidv4().concat('_checkbox'),
      label: $element.text(),
      checked: $input.prop('checked') === 'true',
      children: [],
    };
  };

  private parseRadioButton = ($element: Cheerio<never>): RadioButton => {
    const $input = $element.find('input[type="radio"]');
    return {
      type: 'radio-button',
      pk: uuidv4().concat('_radio'),
      label: $element.text(),
      name: $input.attr('name') || '',
      checked: $input.prop('checked') === 'true',
      children: [],
    };
  };

  private parseTextArea = ($element: Cheerio<never>): TextArea => ({
    type: 'text-area',
    pk: uuidv4(),
    placeholder: $element.attr('placeholder') || '',
    rows: parseInt($element.attr('rows') || '4', 10),
    cols: parseInt($element.attr('cols') || '50', 10),
    children: [],
  });

  private parseHtmlContent = ($element: Cheerio<any>): HtmlContent | null => {
    const el = $element.get(0);
    const tagName = el?.tagName?.toLowerCase() || 'div';
    const rawHtml = $element.text().padEnd(1).padStart(1) || '';
    const attributes: Record<string, any> = {};

    if (tagName === 'p' && (rawHtml === '&nbsp;' || rawHtml === '')) {
      return null;
    }

    if (el?.attribs) {
      Object.entries(el.attribs).forEach(([attr, value]) => {
        if (attr !== 'id') {
          attributes[attr] = value || '';
        }
      });
    }

    return {
      type: 'html',
      pk: uuidv4(),
      tag: tagName,
      content: rawHtml || '',
      attributes,
      children: [],
    };
  };

  private parseElementRecursive = ($element: Cheerio<any>, $: CheerioAPI): BaseComponent | null => {
    let component: BaseComponent | null = null;

    if ($element.is('input[type="checkbox"]')) {
      component = this.parseCheckbox($element.parent() as Cheerio<never>);
    } else if ($element.is('input[type="radio"]')) {
      component = this.parseRadioButton($element.parent() as Cheerio<never>);
    } else if (
      $element.is('input[type="text"]') ||
      $element.is('input[type="email"]') ||
      $element.is('input[type="number"]')
    ) {
      component = this.parseInputField($element.parent() as Cheerio<never>);
    } else if ($element.is('textarea')) {
      component = this.parseTextArea($element as Cheerio<never>);
    } else {
      const dataId = $element.attr('data-id');
      if (dataId && this.componentParsers.has(dataId)) {
        component = this.componentParsers.get(dataId)!($element as Cheerio<never>, $);
      } else {
        component = this.parseHtmlContent($element);
      }
    }

    if (!component) return null;

    const children: BaseComponent[] = [];
    let accumulatedText = '';

    $element.contents().each((_, node) => {
      if (node.type === 'text') {
        const text = node.data;
        if (text && text) {
          accumulatedText += text;
        }
      } else if (node.type === 'tag') {
        if (accumulatedText) {
          const child: HtmlContent = {
            type: 'html',
            pk: uuidv4(),
            tag: 'text',
            content: accumulatedText,
            attributes: {},
            children: [],
          };
          children.push(child);
          accumulatedText = '';
        }
        const $child = $(node);
        const childComponent = this.parseElementRecursive($child, $);
        if (childComponent) {
          children.push(childComponent);
        }
      }
    });

    if (accumulatedText) {
      const child: HtmlContent = {
        type: 'html',
        pk: uuidv4(),
        tag: 'text',
        content: accumulatedText,
        attributes: {},
        children: [],
      };
      children.push(child);
    }

    if (children.length > 0) {
      component.children = children;

      if (component.type === 'html') {
        (component as HtmlContent).content = '';
      }
    }

    return component;
  };

  public parse(htmlContent: string): ContentSection[] {
    const $ = load(htmlContent.replace(/\n/g, ''));
    const sections: ContentSection[] = [];
    let currentSection: ContentSection = { components: [] };

    $('body')
      .children()
      .each((_, element) => {
        const $element = $(element);

        // Handle comment elements
        const commentElement = $element.find('span[id="comment"]');
        let commentContent = '';
        if (commentElement.length) {
          commentContent = commentElement.text() || '';
          commentElement.replaceWith(commentContent);
        }

        // Skip empty paragraphs
        if ($element.is('p') && $element.html() === '&nbsp;') {
          return;
        }

        // Handle UL elements and their LI children
        if ($element.is('ul')) {
          $element.find('li').each((_, li) => {
            const $li = $(li);

            if ($li.attr('data-id') === 'procedure-li') {
              // Finalize current section only if it has a title
              if (currentSection.title || currentSection.components.length > 0) {
                sections.push(currentSection);
              }
              const newSection = {
                title: this.parseProcedure(),
                components: [] as BaseComponent[],
              };
              const component = this.parseElementRecursive($li, $);
              if (component) {
                newSection.components.push(component);
              }
              sections.push(newSection);
              currentSection = { components: [] }; // Reset with empty section
            } else {
              const component = this.parseElementRecursive($li, $);
              if (component) {
                currentSection.components.push(component);
              }
            }
          });
          return; // Skip processing the UL itself
        }

        // Handle title sections
        if ($element.attr('data-id') === 'title-section') {
          if (currentSection.title || currentSection.components.length > 0) {
            sections.push(currentSection);
          }
          currentSection = {
            title: this.parseTitleSection($element as Cheerio<never>),
            components: [],
          };
        } else {
          const component = this.parseElementRecursive($element, $);
          if (component) {
            currentSection.components.push(component);
          }
        }
      });

    // Add final section if it has components or title
    if (currentSection.title || currentSection.components.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }
}

export const createParser = new ContentParser();
