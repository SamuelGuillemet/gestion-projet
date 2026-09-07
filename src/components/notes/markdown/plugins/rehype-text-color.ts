export const TEXT_COLORS = [
  { id: "red", label: "Rouge", value: "#c83226" },
  { id: "orange", label: "Orange", value: "#c45116" },
  { id: "amber", label: "Ambre", value: "#946200" },
  { id: "green", label: "Vert", value: "#23853b" },
  { id: "blue", label: "Bleu", value: "#3169bd" },
  { id: "purple", label: "Violet", value: "#7c4391" },
] as const;

export type TextColor = (typeof TEXT_COLORS)[number]["id"];

type DirectiveNode = {
  type?: string;
  name?: string;
  attributes?: Record<string, string | null | undefined> | null;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children?: DirectiveNode[];
};

export function getTextColorClassName(color: TextColor) {
  return `markdown-text-color-${color}`;
}

export function isTextColor(value: unknown): value is TextColor {
  return TEXT_COLORS.some((color) => color.id === value);
}

export function remarkTextColor() {
  const visit = (node: DirectiveNode) => {
    if (node.type === "textDirective" && node.name === "color") {
      const color = node.attributes?.color;

      if (isTextColor(color)) {
        node.data = {
          ...node.data,
          hName: "span",
          hProperties: {
            ...node.data?.hProperties,
            className: [getTextColorClassName(color)],
          },
        };
      }
    }

    node.children?.forEach(visit);
  };

  return (tree: unknown) => visit(tree as DirectiveNode);
}

export const WORD_TEXT_COLOR_STYLES = TEXT_COLORS.map(
  ({ id, value }) => `.${getTextColorClassName(id)} { color: ${value}; }`,
)
  .concat(
    `:is(.${TEXT_COLORS.map(({ id }) => getTextColorClassName(id)).join(", .")}) * { color: inherit; }`,
  )
  .join("\n      ");
