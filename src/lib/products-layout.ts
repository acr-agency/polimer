export type GridItem = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CategoryLayout = Record<string, GridItem>;

export const productsLayout: Record<number, CategoryLayout> = {
  1: {
    "luk-lm": { x: 1, y: 2, w: 2, h: 1 },
    "luk-l": { x: 3, y: 2, w: 2, h: 1 },
    "13": { x: 5, y: 2, w: 2, h: 1 },

    "luk-c": { x: 1, y: 3, w: 2, h: 1 },
    "luk-t": { x: 3, y: 3, w: 2, h: 1 },
    "luk-tm": { x: 5, y: 3, w: 2, h: 1 },

    "konus-luk-lm": { x: 1, y: 1, w: 6, h: 1 },
    "luk-c-logotipom": { x: 4, y: 4, w: 3, h: 1 },
    "lyuk-s-zapornym-ustroistvom": { x: 1, y: 4, w: 3, h: 1 },
  },

  2: {
    "333-polimerpeschanaya-plitka-na-8-kirpichey": { x: 1, y: 1, w: 2, h: 1 },
    "polimerpeschaniy-bordyur-porebrik": { x: 3, y: 1, w: 2, h: 1 },
    "polimerpeschaniy-livneviy-lotok": { x: 5, y: 1, w: 2, h: 1 },
  },

  3: {
    "kolco-smotrovogo-kolodca": { x: 1, y: 1, w: 3, h: 1 },
    "dno-smotrovogo-kolodca": { x: 4, y: 1, w: 3, h: 1 },
  },
};

export function toGridStyle(item?: GridItem): React.CSSProperties | undefined {
  if (!item) {
    return {
      ["--col" as any]: "span 2",
      ["--row" as any]: "span 1",
    };
  }

  return {
    ["--col" as any]: `${item.x} / span ${item.w}`,
    ["--row" as any]: `${item.y} / span ${item.h}`,
  };
}