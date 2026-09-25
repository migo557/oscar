import { FileLanguage } from '../types';

export interface Token {
  text: string;
  type: 
    | 'keyword' 
    | 'control' 
    | 'string' 
    | 'comment' 
    | 'function' 
    | 'number' 
    | 'type' 
    | 'tag' 
    | 'attribute' 
    | 'operator' 
    | 'variable' 
    | 'plain';
}

const JS_KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'const', 'let', 'var', 'function',
  'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
  'continue', 'new', 'this', 'class', 'extends', 'super', 'interface', 'type',
  'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof',
  'in', 'of', 'as', 'null', 'undefined', 'true', 'false', 'void', 'yield'
]);

const TS_TYPES = new Set([
  'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void',
  'React', 'FC', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
  'Promise', 'Array', 'Record', 'Set', 'Map', 'HTMLCanvasElement', 'CanvasRenderingContext2D'
]);

export function tokenizeLine(line: string, language: FileLanguage): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // 1. Single line comment: // or # or <!--
    if (
      (line[i] === '/' && line[i + 1] === '/') ||
      ((language === 'python' || language === 'bash') && line[i] === '#') ||
      (language === 'html' && line.slice(i, i + 4) === '<!--')
    ) {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    // 2. Strings: "", '', ``
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let str = quote;
      i++;
      let escaped = false;
      while (i < len) {
        const char = line[i];
        str += char;
        if (!escaped && char === quote) {
          i++;
          break;
        }
        escaped = !escaped && char === '\\';
        i++;
      }
      tokens.push({ text: str, type: 'string' });
      continue;
    }

    // 3. Numbers
    if (/\d/.test(line[i])) {
      let num = '';
      while (i < len && /[\d.xXa-fA-F_]/.test(line[i])) {
        num += line[i];
        i++;
      }
      // Check px, rem, ms suffix in CSS
      if (language === 'css' && i < len && /[a-z%]/.test(line[i])) {
        while (i < len && /[a-z%]/.test(line[i])) {
          num += line[i];
          i++;
        }
      }
      tokens.push({ text: num, type: 'number' });
      continue;
    }

    // 4. JSX / HTML Tags: <Tag or </Tag>
    if ((language === 'tsx' || language === 'jsx' || language === 'html') && line[i] === '<') {
      let tagStr = '<';
      i++;
      if (i < len && line[i] === '/') {
        tagStr += '/';
        i++;
      }
      let tagName = '';
      while (i < len && /[a-zA-Z0-9_-]/.test(line[i])) {
        tagName += line[i];
        i++;
      }
      if (tagName) {
        tokens.push({ text: tagStr + tagName, type: 'tag' });
        continue;
      } else {
        tokens.push({ text: tagStr, type: 'operator' });
        continue;
      }
    }

    // 5. Identifiers / Words
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check if followed by ( -> function call
      let nextIdx = i;
      while (nextIdx < len && /\s/.test(line[nextIdx])) nextIdx++;
      const isFn = nextIdx < len && line[nextIdx] === '(';

      // Check if followed by = -> JSX attribute or object key
      let isAttr = false;
      if (language === 'tsx' || language === 'jsx' || language === 'html') {
        if (nextIdx < len && line[nextIdx] === '=') {
          isAttr = true;
        }
      }

      if (JS_KEYWORDS.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (TS_TYPES.has(word) || /^[A-Z][a-zA-Z0-9]*$/.test(word)) {
        tokens.push({ text: word, type: 'type' });
      } else if (isFn) {
        tokens.push({ text: word, type: 'function' });
      } else if (isAttr) {
        tokens.push({ text: word, type: 'attribute' });
      } else {
        tokens.push({ text: word, type: 'variable' });
      }
      continue;
    }

    // 6. Operators & Punctuation
    if (/^[=+\-*/%&|^!<>?:~;.,(){}[\]]/.test(line[i])) {
      tokens.push({ text: line[i], type: 'operator' });
      i++;
      continue;
    }

    // 7. Whitespace or others
    let other = line[i];
    i++;
    tokens.push({ text: other, type: 'plain' });
  }

  return tokens;
}

export function getTokenColor(type: Token['type'], isLight = false): string {
  if (isLight) {
    switch (type) {
      case 'keyword': return '#0000ff';
      case 'control': return '#af00db';
      case 'string': return '#a31515';
      case 'comment': return '#008000';
      case 'function': return '#795e26';
      case 'number': return '#098658';
      case 'type': return '#267f99';
      case 'tag': return '#800000';
      case 'attribute': return '#e50000';
      case 'operator': return '#000000';
      case 'variable': return '#001080';
      default: return '#000000';
    }
  }

  // VS Code Dark Modern default
  switch (type) {
    case 'keyword': return '#c586c0';
    case 'control': return '#c586c0';
    case 'string': return '#ce9178';
    case 'comment': return '#6a9955';
    case 'function': return '#dcdcaa';
    case 'number': return '#b5cea8';
    case 'type': return '#4ec9b0';
    case 'tag': return '#569cd6';
    case 'attribute': return '#9cdcfe';
    case 'operator': return '#d4d4d4';
    case 'variable': return '#9cdcfe';
    default: return '#cccccc';
  }
}
