export type ArtPreset = 'aurora' | 'ember' | 'dusk' | 'glacier' | 'verdant';

export type ArtRecipe = {
  /** `marble` folds the colours through each other; `streak` pulls them into a long exposure. */
  style: 'marble' | 'streak';
  /** Two or more colours, in the order they appear through the field. */
  colors: string[];
  /** Size of the forms. Lower is larger and calmer. */
  scale?: number;
  /** How hard the field folds into itself. */
  warp?: number;
  /** Direction of the flow, in radians. */
  angle?: number;
  /** Specular highlight on the liquid surface, 0–1. */
  gloss?: number;
  /** Dark veins along the folds, 0–1. */
  veins?: number;
};

export type FolderArt = ArtPreset | ArtRecipe | 'none';

export type FolderFile = {
  name: string;
  /** A short second line: a size, a date, a kind. */
  meta?: string;
  /** Makes the file a picture: a generated artwork… */
  art?: ArtPreset | ArtRecipe;
  /** …or an image of your own. Without either, the file is a sheet of paper. */
  image?: string;
  /** Rendered as a link when the folder is open. */
  href?: string;
};

export type FolderMenuItem = {
  label: string;
  onSelect?: () => void;
  /** Drawn in red, for the one you would want to think twice about. */
  danger?: boolean;
};

export type GlassFolderProps = {
  label?: string;
  /** The second line. Defaults to the number of files, which rolls as you add. */
  meta?: string;
  /** `light` is milk glass, `dark` is smoked glass. */
  tone?: 'light' | 'dark';
  /** What the back panel holds. A preset, your own recipe, or `none` for a plain frosted back. */
  art?: FolderArt;
  /** A different arrangement of the same recipe. */
  seed?: number;
  /** Your own picture for the back panel, instead of generated art. */
  image?: string;
  /** The folder's contents. Read once; after that the folder owns the list. */
  files?: FolderFile[];
  /** Render file images as loose previews without paper cards or labels. */
  filePresentation?: 'cards' | 'photos';
  /** `add` drops new files in, `more` opens a menu, `none` hides the key. */
  action?: 'add' | 'more' | 'none';
  /** What `add` puts in the folder. Return nothing for an "Untitled" sheet. */
  onAdd?: (files: FolderFile[]) => FolderFile | void;
  onFilesChange?: (files: FolderFile[]) => void;
  /** Items for the `more` menu. An Open / Close item is always first. */
  menu?: FolderMenuItem[];
  /** Where the label sits on the front panel. */
  labelPlacement?: 'bottom-left' | 'top-left' | 'top-right';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called when a file is chosen while the folder is open. */
  onFileSelect?: (file: FolderFile, index: number) => void;
  /** Width in px. Everything else scales with it; the height is 0.96 × width. */
  width?: number;
  /** Assemble itself the first time it scrolls into view. */
  appear?: boolean;
  /** Delay before that entrance, in ms — for staggering a row of folders. */
  appearDelay?: number;
  className?: string;
  style?: React.CSSProperties;
};
