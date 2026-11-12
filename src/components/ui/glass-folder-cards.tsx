'use client';

import Image from 'next/image';
import * as React from 'react';

import { fanSlot, hashString, rng } from './glass-folder-art';
import { GF_CSS } from './glass-folder-cards.styles';
import {
  SAMPLE_FILES,
  useAppearOnView,
  useControlledOpen,
  useFolderDismiss,
  useFolderFiles,
  usePointerParallax,
} from './glass-folder-hooks';
import { handleMenuKeyNav } from './glass-folder-menu-nav';
import { ArtCanvas } from './glass-folder-paint';

import type { FolderArt, FolderFile, FolderMenuItem, GlassFolderProps } from './glass-folder-types';

export type {
  ArtPreset,
  ArtRecipe,
  FolderArt,
  FolderFile,
  FolderMenuItem,
  GlassFolderProps,
} from './glass-folder-types';
export { ART_PRESETS, createArtJob, fanSlot, hashString, hexToRgb } from './glass-folder-art';

/**
 * Glass Folder Cards — a folder you can actually use, drawn as an object.
 *
 * Three layers, back to front: a back panel holding a piece of artwork, the
 * files the folder contains, and a frosted-glass front panel that blurs
 * whatever sits behind it. Nothing is a picture of a folder; the files are
 * real elements between real panels, so the glass frosts them as they move.
 *
 * - **Rest**: flat and closed. The tops of the files only just show.
 * - **Hover / focus**: the front panel leans toward you on its bottom hinge
 *   and the files lift a little out of the pocket.
 * - **Open** (click, Enter, Space): the panel falls further forward and the
 *   files rise out and fan, each one a button with its name on it.
 * - **Add** (`+`): a new file drops into the folder, the pocket gives a little
 *   under it, and the count rolls over.
 * - **More** (`···`): a frosted menu you can drive from the keyboard.
 *
 * The artwork is generated, not fetched: a domain-warped noise field shaded
 * as a liquid surface, painted once per recipe into a canvas over a few
 * frames and shared between every folder that uses it. Supply `image` to use
 * a picture of your own instead.
 *
 * UI lives here; art engine / types / CSS string are sibling modules. No images, no fonts.
 */

const W = 340;
const H = 272;
const HEADROOM = 54;
const FRONT_TOP = 74;
const FRONT_H = H - FRONT_TOP;
const SHEET_W = 272;
const SHEET_H = 184;

const BACK_PATH =
  'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
const FRONT_PATH =
  'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 ' +
  (FRONT_H - 22) +
  'A22 22 0 0 1 318 ' +
  FRONT_H +
  'L22 ' +
  FRONT_H +
  'A22 22 0 0 1 0 ' +
  (FRONT_H - 22) +
  'Z';

function FolderBackArt({
  image,
  art,
  seed,
  density,
}: Readonly<{
  image?: string;
  art: FolderArt;
  seed: number;
  density: number;
}>) {
  let artNode: React.ReactNode = null;
  if (image) {
    artNode = <FolderRaster className="gf-art" src={image} width={W + 24} height={H + 24} />;
  } else if (art !== 'none') {
    artNode = (
      <ArtCanvas
        className="gf-art"
        art={art}
        seed={seed}
        w={W + 24}
        h={H + 24}
        density={density}
        priority={0}
      />
    );
  }
  return (
    <>
      <div className="gf-back" style={{ clipPath: "path('" + BACK_PATH + "')" }} aria-hidden="true">
        {artNode}
        <div className="gf-back-sheen" />
      </div>
      <svg className="gf-rim gf-back-rim" viewBox={'0 0 ' + W + ' ' + H} aria-hidden="true">
        <path d={BACK_PATH} />
      </svg>
    </>
  );
}

function FolderFrontFace({
  uid,
  bump,
  open,
  label,
  count,
  metaLine,
  hitRef,
  onToggle,
}: Readonly<{
  uid: string;
  bump: number;
  open: boolean;
  label: string;
  count: number;
  metaLine: string;
  hitRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
}>) {
  const itemWord = count === 1 ? ' item' : ' items';
  return (
    <div
      key={bump}
      className={'gf-front' + (bump ? ' gf-front--bump' : '')}
      style={{ clipPath: "path('" + FRONT_PATH + "')" }}
    >
      <div className="gf-tint" aria-hidden="true" />
      <div className="gf-spec" aria-hidden="true" />
      <svg className="gf-rim gf-front-rim" viewBox={'0 0 ' + W + ' ' + FRONT_H} aria-hidden="true">
        <defs>
          <linearGradient id={'gf-rim-' + uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path d={FRONT_PATH} stroke={'url(#gf-rim-' + uid + ')'} />
      </svg>
      <button
        ref={hitRef}
        type="button"
        className="gf-hit"
        aria-expanded={open}
        aria-label={(open ? 'Close ' : 'Open ') + label + ', ' + count + itemWord}
        onClick={onToggle}
      />
      <div className="gf-label">
        <span className="gf-title">{label}</span>
        <span className="gf-meta" key={metaLine}>
          {metaLine}
        </span>
      </div>
    </div>
  );
}

function isRemoteImageSrc(src: string): boolean {
  return /^(https?:|data:|blob:)/i.test(src);
}

function FolderRaster({
  src,
  className,
  width,
  height,
}: Readonly<{ src: string; className: string; width: number; height: number }>) {
  return (
    <Image
      className={className}
      src={src}
      alt=""
      width={width}
      height={height}
      draggable={false}
      unoptimized={isRemoteImageSrc(src)}
    />
  );
}

function SheetArtBody({ file, density }: Readonly<{ file: FolderFile; density: number }>) {
  if (file.image) {
    return (
      <FolderRaster className="gf-sheet-art" src={file.image} width={SHEET_W} height={SHEET_H} />
    );
  }
  if (file.art) {
    return (
      <ArtCanvas
        className="gf-sheet-art"
        art={file.art}
        seed={hashString({ text: file.name }) % 997}
        w={SHEET_W}
        h={SHEET_H}
        density={Math.min(density, 1.25)}
        priority={1}
      />
    );
  }
  return (
    <span className="gf-lines" aria-hidden="true">
      <i style={{ width: '86%' }} />
      <i style={{ width: '92%' }} />
      <i style={{ width: '64%' }} />
      <i style={{ width: '88%' }} />
      <i style={{ width: '42%' }} />
    </span>
  );
}

function FolderSheetItem({
  file,
  id,
  fileIndex,
  visualIndex,
  slot,
  depth,
  dropped,
  density,
  onSelect,
  onDropEnd,
}: Readonly<{
  file: FolderFile;
  id: number;
  fileIndex: number;
  visualIndex: number;
  slot: number;
  depth: number;
  dropped: number | null;
  density: number;
  onSelect?: (file: FolderFile, index: number) => void;
  onDropEnd: () => void;
}>) {
  const jitter = rng({ seed: hashString({ text: file.name }) + id });
  const picture = !!(file.art || file.image);
  const common = {
    className:
      'gf-sheet' + (picture ? ' gf-sheet--art' : '') + (id === dropped ? ' gf-sheet--drop' : ''),
    style: {
      '--gf-slot': slot,
      '--gf-depth': depth,
      '--gf-jx': ((jitter() - 0.5) * 10).toFixed(2) + 'px',
      '--gf-jr': ((jitter() - 0.5) * 3.2).toFixed(2) + 'deg',
      zIndex: visualIndex + 1,
    } as React.CSSProperties,
    onAnimationEnd: id === dropped ? onDropEnd : undefined,
  };
  const inner = (
    <>
      <SheetArtBody file={file} density={density} />
      <span className="gf-sheet-head">
        <span className="gf-sheet-name">{file.name}</span>
        {file.meta ? <span className="gf-sheet-meta">{file.meta}</span> : null}
      </span>
    </>
  );
  return (
    <li className="gf-sheet-slot">
      {file.href ? (
        <a {...common} href={file.href} onClick={() => onSelect?.(file, fileIndex)}>
          {inner}
        </a>
      ) : (
        <button {...common} type="button" onClick={() => onSelect?.(file, fileIndex)}>
          {inner}
        </button>
      )}
    </li>
  );
}

function FolderFilesList({
  filesRef,
  label,
  visible,
  ids,
  start,
  dropped,
  density,
  onFileSelect,
  setDropped,
}: Readonly<{
  filesRef: React.RefObject<HTMLUListElement | null>;
  label: string;
  visible: FolderFile[];
  ids: React.RefObject<number[]>;
  start: number;
  dropped: number | null;
  density: number;
  onFileSelect?: (file: FolderFile, index: number) => void;
  setDropped: (id: number | null) => void;
}>) {
  return (
    <ul ref={filesRef} className="gf-files" aria-label={label + ' contents'}>
      {visible.map((file, v) => (
        <FolderSheetItem
          key={ids.current[start + v]!}
          file={file}
          id={ids.current[start + v]!}
          fileIndex={start + v}
          visualIndex={v}
          slot={fanSlot({ index: v, count: visible.length })}
          depth={visible.length - 1 - v}
          dropped={dropped}
          density={density}
          onSelect={onFileSelect}
          onDropEnd={() => setDropped(null)}
        />
      ))}
    </ul>
  );
}

function FolderActionKey({
  action,
  label,
  uid,
  bump,
  menuOpen,
  keyRef,
  onAdd,
  onToggleMenu,
}: Readonly<{
  action: 'add' | 'more';
  label: string;
  uid: string;
  bump: number;
  menuOpen: boolean;
  keyRef: React.RefObject<HTMLButtonElement | null>;
  onAdd: () => void;
  onToggleMenu: () => void;
}>) {
  return (
    <button
      ref={keyRef}
      type="button"
      className={'gf-key gf-key--' + action}
      aria-label={action === 'add' ? 'Add a file to ' + label : 'More options for ' + label}
      aria-haspopup={action === 'more' ? 'menu' : undefined}
      aria-expanded={action === 'more' ? menuOpen : undefined}
      aria-controls={action === 'more' ? 'gf-menu-' + uid : undefined}
      onClick={() => (action === 'add' ? onAdd() : onToggleMenu())}
    >
      {action === 'add' ? (
        <svg key={bump} className="gf-glyph gf-glyph--plus" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.5v15M4.5 12h15" />
        </svg>
      ) : (
        <svg className="gf-glyph gf-glyph--more" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      )}
    </button>
  );
}

function FolderMenuItemButton({
  item,
  menuOpen,
  keyRef,
  setMenuOpen,
}: Readonly<{
  item: FolderMenuItem;
  menuOpen: boolean;
  keyRef: React.RefObject<HTMLButtonElement | null>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={menuOpen ? -1 : undefined}
      disabled={!menuOpen}
      className={'gf-menu-item' + (item.danger ? ' gf-menu-item--danger' : '')}
      onClick={() => {
        setMenuOpen(false);
        keyRef.current?.focus();
        item.onSelect?.();
      }}
    >
      {item.label}
    </button>
  );
}

function FolderOptionsMenu({
  uid,
  label,
  menuOpen,
  menuItems,
  menuRef,
  keyRef,
  setMenuOpen,
}: Readonly<{
  uid: string;
  label: string;
  menuOpen: boolean;
  menuItems: FolderMenuItem[];
  menuRef: React.RefObject<HTMLDivElement | null>;
  keyRef: React.RefObject<HTMLButtonElement | null>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>) {
  return (
    <div
      ref={menuRef}
      id={'gf-menu-' + uid}
      role="menu"
      tabIndex={-1}
      aria-label={label + ' options'}
      className="gf-menu"
      data-open={menuOpen || undefined}
      onKeyDown={(e) => handleMenuKeyNav(e, menuRef, setMenuOpen)}
    >
      {menuItems.map((item, i) => (
        <FolderMenuItemButton
          key={item.label + i}
          item={item}
          menuOpen={menuOpen}
          keyRef={keyRef}
          setMenuOpen={setMenuOpen}
        />
      ))}
    </div>
  );
}

function artPixelDensity(width: number): { k: number; density: number } {
  const k = width / W;
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  return { k, density: Math.min(1.5, Math.max(1, dpr)) * k };
}

type GlassFolderStageModel = {
  uid: string;
  label: string;
  art: FolderArt;
  seed: number;
  image?: string;
  action: 'add' | 'more' | 'none';
  density: number;
  width: number;
  k: number;
  open: boolean;
  setOpen: (next: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bump: number;
  count: number;
  metaLine: string;
  visible: FolderFile[];
  ids: React.RefObject<number[]>;
  start: number;
  dropped: number | null;
  setDropped: (id: number | null) => void;
  addFile: () => void;
  menuItems: FolderMenuItem[];
  onFileSelect?: (file: FolderFile, index: number) => void;
  hitRef: React.RefObject<HTMLButtonElement | null>;
  filesRef: React.RefObject<HTMLUListElement | null>;
  keyRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

function GlassFolderStage({ m }: Readonly<{ m: GlassFolderStageModel }>) {
  return (
    <div
      className="gf-stage"
      style={{
        left: (m.width - W) / 2 + 'px',
        transformOrigin: '50% 0',
        transform:
          'translateY(' +
          HEADROOM * m.k +
          'px) scale(' +
          m.k +
          ') scaleX(var(--gf-width-scale, 1))',
      }}
    >
      <div className="gf-tilt">
        <div className="gf-shadow" aria-hidden="true" />
        <FolderBackArt image={m.image} art={m.art} seed={m.seed} density={m.density} />
        <FolderFrontFace
          uid={m.uid}
          bump={m.bump}
          open={m.open}
          label={m.label}
          count={m.count}
          metaLine={m.metaLine}
          hitRef={m.hitRef}
          onToggle={() => {
            m.setMenuOpen(false);
            m.setOpen(!m.open);
          }}
        />
        <FolderFilesList
          filesRef={m.filesRef}
          label={m.label}
          visible={m.visible}
          ids={m.ids}
          start={m.start}
          dropped={m.dropped}
          density={m.density}
          onFileSelect={m.onFileSelect}
          setDropped={m.setDropped}
        />
        {m.action !== 'none' ? (
          <FolderActionKey
            action={m.action}
            label={m.label}
            uid={m.uid}
            bump={m.bump}
            menuOpen={m.menuOpen}
            keyRef={m.keyRef}
            onAdd={m.addFile}
            onToggleMenu={() => m.setMenuOpen((open) => !open)}
          />
        ) : null}
        {m.action === 'more' ? (
          <FolderOptionsMenu
            uid={m.uid}
            label={m.label}
            menuOpen={m.menuOpen}
            menuItems={m.menuItems}
            menuRef={m.menuRef}
            keyRef={m.keyRef}
            setMenuOpen={m.setMenuOpen}
          />
        ) : null}
      </div>
    </div>
  );
}

function useGlassFolderController(props: Readonly<GlassFolderProps>) {
  const {
    label = 'My Files',
    meta,
    art = 'aurora',
    seed = 3,
    image,
    files: initialFiles = SAMPLE_FILES,
    action = 'add',
    onAdd,
    onFilesChange,
    menu = [],
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onFileSelect,
    width = 340,
    appear = true,
    appearDelay = 0,
  } = props;

  const uid = React.useId().replace(/:/g, '');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const filesRef = React.useRef<HTMLUListElement>(null);
  const hitRef = React.useRef<HTMLButtonElement>(null);
  const keyRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const dismissRefs = React.useMemo(() => ({ rootRef, hitRef, keyRef, menuRef }), []);

  const { open, setOpen } = useControlledOpen(openProp, defaultOpen, onOpenChange);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const entered = useAppearOnView(rootRef, appear, appearDelay);
  usePointerParallax(rootRef);
  useFolderDismiss({ open, menuOpen, setOpen, setMenuOpen, refs: dismissRefs });

  React.useEffect(() => {
    filesRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  React.useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
  }, [menuOpen]);

  const fileState = useFolderFiles(initialFiles, onAdd, onFilesChange);
  const { k, density } = artPixelDensity(width);
  const metaLine = meta ?? fileState.count + (fileState.count === 1 ? ' item' : ' items');

  const stage: GlassFolderStageModel = {
    uid,
    label,
    art,
    seed,
    image,
    action,
    density,
    width,
    k,
    open,
    setOpen,
    menuOpen,
    setMenuOpen,
    bump: fileState.bump,
    count: fileState.count,
    metaLine,
    visible: fileState.visible,
    ids: fileState.ids,
    start: fileState.start,
    dropped: fileState.dropped,
    setDropped: fileState.setDropped,
    addFile: fileState.addFile,
    menuItems: [
      { label: open ? 'Close folder' : 'Open folder', onSelect: () => setOpen(!open) },
      ...menu,
    ],
    onFileSelect,
    hitRef,
    filesRef,
    keyRef,
    menuRef,
  };

  return { rootRef, entered, k, stage };
}

export default function GlassFolder(props: Readonly<GlassFolderProps>) {
  const {
    tone = 'light',
    filePresentation = 'cards',
    labelPlacement = 'bottom-left',
    width = 340,
    className,
    style,
  } = props;
  const { rootRef, entered, k, stage } = useGlassFolderController(props);

  return (
    <div
      ref={rootRef}
      className={'gf-root' + (className ? ' ' + className : '')}
      data-tone={tone}
      data-file-presentation={filePresentation}
      data-open={stage.open || undefined}
      data-entered={entered || undefined}
      data-place={labelPlacement}
      style={{ width, height: (H + HEADROOM) * k, ...style }}
    >
      <style>{GF_CSS}</style>
      <GlassFolderStage m={stage} />
    </div>
  );
}
