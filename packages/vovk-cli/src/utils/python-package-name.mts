import { toUnderscoredPackageName } from 'vovk/internal';

// Python keywords, Python takes none of them as a module name
const PYTHON_KEYWORDS = new Set(
  `False None True and as assert async await break class continue def del elif else except finally for from global if
  import in is lambda nonlocal not or pass raise return try while with yield`.split(/\s+/)
);

// the name Python imports a py_name by, as vovk's code samples have it: one it can import stays as it is,
// a Rust keyword too; any other is made valid as an npm name is, "acme-client" becomes "acme_client"
export function toPythonPackageName(name: string): string {
  return /^[\p{XID_Start}_]\p{XID_Continue}*$/u.test(name) && !PYTHON_KEYWORDS.has(name)
    ? name
    : toUnderscoredPackageName(name);
}

// the public top-level modules of the Python 3.9 to 3.14 standard library as sys.stdlib_module_names lists them, and
// test, which it leaves out; the standard library comes first on sys.path, so a package so named can't be imported
export const PYTHON_STDLIB_MODULES = new Set(
  `abc aifc annotationlib antigravity argparse array ast asynchat asyncio asyncore atexit audioop base64 bdb binascii
  binhex bisect builtins bz2 calendar cgi cgitb chunk cmath cmd code codecs codeop collections colorsys compileall
  compression concurrent configparser contextlib contextvars copy copyreg cProfile crypt csv ctypes curses
  dataclasses datetime dbm decimal difflib dis distutils doctest email encodings ensurepip enum errno faulthandler
  fcntl filecmp fileinput fnmatch formatter fractions ftplib functools gc genericpath getopt getpass gettext glob
  graphlib grp gzip hashlib heapq hmac html http idlelib imaplib imghdr imp importlib inspect io ipaddress itertools
  json keyword lib2to3 linecache locale logging lzma mailbox mailcap marshal math mimetypes mmap modulefinder msilib
  msvcrt multiprocessing netrc nis nntplib nt ntpath nturl2path numbers opcode operator optparse os ossaudiodev
  parser pathlib pdb pickle pickletools pipes pkgutil platform plistlib poplib posix posixpath pprint profile pstats
  pty pwd py_compile pyclbr pydoc pydoc_data pyexpat queue quopri random re readline reprlib resource rlcompleter
  runpy sched secrets select selectors shelve shlex shutil signal site smtpd smtplib sndhdr socket socketserver spwd
  sqlite3 sre_compile sre_constants sre_parse ssl stat statistics string stringprep struct subprocess sunau symbol
  symtable sys sysconfig syslog tabnanny tarfile telnetlib tempfile termios test textwrap this threading time timeit
  tkinter token tokenize tomllib trace traceback tracemalloc tty turtle turtledemo types typing unicodedata unittest
  urllib uu uuid venv warnings wave weakref webbrowser winreg winsound wsgiref xdrlib xml xmlrpc zipapp zipfile
  zipimport zlib zoneinfo`.split(/\s+/)
);
