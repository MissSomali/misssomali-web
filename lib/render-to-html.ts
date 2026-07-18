export function renderToHtml(element: any): string {
  if (element === null || element === undefined) return "";
  if (typeof element === "string" || typeof element === "number" || typeof element === "boolean") {
    // Escape HTML characters to prevent XSS (standard practice)
    return String(element)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  if (Array.isArray(element)) {
    return element.map(renderToHtml).join("");
  }
  
  const { type, props } = element;
  if (!type) return "";

  if (typeof type === "function") {
    // It's a React component, execute it
    return renderToHtml(type(props));
  }
  
  // It's a standard HTML tag
  const { children, style, href, ...otherProps } = props || {};
  
  // Convert style object to inline CSS string
  let styleStr = "";
  if (style && typeof style === "object") {
    styleStr = Object.entries(style)
      .map(([key, val]) => {
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${kebabKey}:${val}`;
      })
      .join(";");
  }
  
  // Construct attributes string
  let attrs = "";
  if (styleStr) attrs += ` style="${styleStr}"`;
  if (href) attrs += ` href="${href}"`;
  
  for (const [key, val] of Object.entries(otherProps)) {
    if (key === "className") {
      attrs += ` class="${val}"`;
    } else if (key === "charSet") {
      attrs += ` charset="${val}"`;
    } else if (key !== "children" && val !== undefined && val !== null) {
      attrs += ` ${key.toLowerCase()}="${String(val)}"`;
    }
  }
  
  const childrenStr = renderToHtml(children);
  
  // Self-closing tags
  const selfClosing = ["meta", "img", "br", "hr", "link", "input"];
  if (selfClosing.includes(type)) {
    return `<${type}${attrs} />`;
  }
  
  return `<${type}${attrs}>${childrenStr}</${type}>`;
}
