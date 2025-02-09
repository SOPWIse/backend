export interface BaseComponent {
  type: string;
  pk?: string;
  children?: BaseComponent[];
}

export interface TitleSection extends BaseComponent {
  type: 'title-section';
  title: string;
  subtitle?: string;
}

export interface InputField extends BaseComponent {
  type: 'input-field';
  placeholder?: string;
}

export interface CheckboxField extends BaseComponent {
  type: 'checkbox';
  label: string;
  checked: boolean;
}

export interface RadioButton extends BaseComponent {
  type: 'radio-button';
  label: string;
  name: string;
  checked: boolean;
}

export interface TextArea extends BaseComponent {
  type: 'text-area';
  placeholder?: string;
  value?: string;
  rows: number;
  cols: number;
}

export interface HtmlContent extends BaseComponent {
  type: 'html';
  tag: string;
  content: string;
  attributes: Record<string, string>;
}

export interface ContentSection {
  title?: TitleSection;
  components: BaseComponent[];
}
