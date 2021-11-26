import FS from 'fs';
import PATH from 'path';

const constants = {
  DIRECTORY: 'directory',
  FILE: 'file',
};

export interface FileAttributes {
  size: number;
  atimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
}

export interface DirectoryTreeOptions {
  exclude?: RegExp | RegExp[]; // A RegExp or an array of RegExp to test for exlusion of directories.
  extensions?: RegExp; // A RegExp to test for exclusion of files with the matching extension.
  attributes?: Boolean; // Array of FS.stats attributes.
  normalizePath?: Boolean; // If true, windows style paths will be normalized to unix style pathes (/ instead of \).
}

export interface Dictionary<T> {
  [Key: string]: T;
}

export interface DirectoryTreeItem {
  header?: string;
  label: string;
  size: number;
  name: string;
  path: string;
  extension: string;
  type: string;
  attributes: FileAttributes;
  children?: (DirectoryTreeItem | null)[];
}

export interface DirectoryTreeCB {
  (item: DirectoryTreeItem, path: string, stats: FS.Stats): DirectoryPermissions;
}

export interface DirectoryPermissions {
  path: string;
}

function safeReadDirSync(path: string) {
  let dirData = {};
  try {
    dirData = FS.readdirSync(path);
  } catch (ex) {
    if (ex.code == 'EACCES' || ex.code == 'EPERM') {
      //User does not have permissions, ignore directory
      return null;
    } else throw ex;
  }
  return dirData;
}

/**
 * Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style).
 * @param  {string} path
 * @return {string}
 */
function normalizePath(path: string) {
  return path.replace(/\\/g, '/');
}

/**
 * Tests if the supplied parameter is of type RegExp
 * @param  {any}  regExp
 * @return {Boolean}
 */
function isRegExp(regExp: any) {
  return typeof regExp === 'object' && regExp.constructor == RegExp;
}

/**
 * Tests if the supplied parameter is of type RegExp
 * @param  {any}  stats
 * @return {FileAttributes}
 */
function copyAttributes(stats: any): FileAttributes {
  const result: { [key: string]: string | number } = {};
  const keys = ['size', 'atimeMs', 'ctimeMs', 'birthtimeMs'];
  keys.map((o) => {
    result[o] = stats[o];
  });
  return (result as unknown) as FileAttributes;
}

/**
 * Collects the files for a directory path into an Object, subject
 * to the options supplied, and invoking optional
 * @param  {String} path
 * @param  {Object} options
 * @param  {function} onEachFile
 * @param  {function} onEachDirectory
 * @return {Object}
 */
export function directory(path: string, options: DirectoryTreeOptions, onEachFile?: DirectoryTreeCB, onEachDirectory?: DirectoryTreeCB): DirectoryTreeItem | null {
  const name = PATH.basename(path);
  path = options && options.normalizePath ? normalizePath(path) : path;
  const item = <DirectoryTreeItem>{};
  item.path = path;
  item.name = name;
  item.label = name;
  item.attributes = <FileAttributes>{};
  item.children = [];
  item.type = constants.DIRECTORY;

  let stats: FS.Stats;

  try {
    stats = FS.statSync(path);
  } catch (e) {
    return null;
  }

  if (!stats.isDirectory()) {
    return null;
  }
  item.header = name;
  item.size = stats.size;
  const ext = PATH.extname(path).toLowerCase();
  item.extension = ext;

  let dirData = safeReadDirSync(path);
  if (dirData === null) return null;

  if (options && options.attributes) {
    item.attributes = copyAttributes(stats);
  }
  if (onEachDirectory) {
    const permissions = onEachDirectory(item, path, stats);
    console.log(permissions);
    item.path = permissions.path;
  }

  const data = Object.values(dirData);

  data.map((child: any) => {
    const _item = <DirectoryTreeItem>{};
    _item.path = path;
    _item.name = child;
    _item.label = child;
    _item.attributes = <FileAttributes>{};
    _item.children = [];
    _item.type = '';
    const stats: FS.Stats = FS.statSync(path + '/' + child);
    if (stats.isFile()) {
      _item.type = constants.FILE;
    } else {
      _item.type = constants.DIRECTORY;
    }
    if (_item.type !== '') {
      _item.size = stats.size;
      const ext = PATH.extname(child).toLowerCase();
      _item.extension = ext;

      // Skip if it does not match the extension regex
      let skip = (options && options.extensions && !options.extensions.test(ext)) || false;
      // Skip if it matches the exclude regex
      if (options && options.exclude) {
        const excludes = isRegExp(options.exclude) ? [options.exclude] : options.exclude;
        if ((excludes as RegExp[]).some((exclusion) => exclusion.test(path))) {
          skip = true;
        }
      }

      if (!skip) {
        _item.size = stats.size; // File size in bytes
        _item.extension = ext;

        _item.attributes = <FileAttributes>{};

        if (options && options.attributes) {
          _item.attributes = copyAttributes(stats);
        }

        if (onEachFile) {
          const permissions = onEachFile(_item, path, stats);
          console.log(permissions);
          _item.path = permissions.path;
        }

        item.children?.push(_item);
      }
    }
  });

  return item;
}

/**
 * Collects the files and folders for a directory path into an Object, subject
 * to the options supplied, and invoking optional
 * @param  {String} path
 * @param  {Object} options
 * @param  {function} onEachFile
 * @param  {function} onEachDirectory
 * @return {Object}
 */
export function directoryTree(path: string, options: DirectoryTreeOptions, onEachFile?: DirectoryTreeCB, onEachDirectory?: DirectoryTreeCB): DirectoryTreeItem | null {
  const name = PATH.basename(path);
  path = options && options.normalizePath ? normalizePath(path) : path;
  const item = <DirectoryTreeItem>{};
  item.path = path;
  item.name = name;
  item.label = name;
  item.attributes = <FileAttributes>{};
  let stats: FS.Stats;

  try {
    stats = FS.statSync(path);
  } catch (e) {
    return null;
  }

  // Skip if it matches the exclude regex
  if (options && options.exclude) {
    const excludes = isRegExp(options.exclude) ? [options.exclude] : options.exclude;
    if ((excludes as RegExp[]).some((exclusion) => exclusion.test(path))) {
      return null;
    }
  }

  if (stats.isFile()) {
    const ext = PATH.extname(path).toLowerCase();

    // Skip if it does not match the extension regex
    if (options && options.extensions && !options.extensions.test(ext)) return null;

    item.size = stats.size; // File size in bytes
    item.extension = ext;
    item.type = constants.FILE;
    item.attributes = <FileAttributes>{};

    if (options && options.attributes) {
      item.attributes = copyAttributes(stats);
    }

    if (onEachFile) {
      const permissions = onEachFile(item, path, stats);
      console.log(permissions);
      item.path = permissions.path;
    }
  } else if (stats.isDirectory()) {
    let dirData = safeReadDirSync(path);
    if (dirData === null) return null;

    if (options && options.attributes) {
      item.attributes = copyAttributes(stats);
    }
    const data = Object.values(dirData);
    item.children = data.map((child: any) => directoryTree(PATH.join(path, child), options, onEachFile, onEachDirectory)).filter((e) => !!e);
    item.size = item.children.reduce((prev, cur) => {
      let size = cur ? cur.size : 0;
      return prev + size;
    }, 0);
    item.type = constants.DIRECTORY;
    item.header = name;
    if (onEachDirectory) {
      const permissions = onEachDirectory(item, path, stats);
      console.log(permissions);
      item.path = permissions.path;
    }
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  return item;
}
